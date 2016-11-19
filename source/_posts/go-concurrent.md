---
title: Go Concurrency
comments: true
---

首先，并发不是并行。Golang在发布的时候，也引起很多这样的错误认识：为什么我的Golang代码跑在4核的机器上反而更慢了。

并发是你试图同时处理很多事情，并行是同时处理很多事情。并发体现的是代码的上层逻辑结构，而并行体现的代码**执行**情况。所以，在代码逻辑上并发的，在执行上并不一定是并行的。

并发一种很好的架构代码的方式，将代码分成能够独立执行的片段。这样能写出简单优美的代码。

Golang提供了三种工具来支持concurrency:

- goroutines: 并发执行
- channels: 同步和消息
- select: 多路的并发控制

下面对着三个工具极其应用进行详细介绍

## Goroutine

goroutines有别于现在的threads, coroutines, precesses, 他的模型十分简单:

>it is a function executing concurrently with other goroutines in the same
>address space

goroutine非常的轻，仅需要较少的栈空间。

goroutines能够多路复用到多个系统线程上，所以即便一个goroutine阻塞了，其他的还能继续运行。goroutine的设计隐藏很多线程创建、管理上的复杂性。

在一个函数或方法调用的前面加上一个关键词key，就能创建一个新的goroutine，这次调用将在这个goroutine中运行。当调用结束时，这个goroutine也将退出(悄悄地)。

    go list.Sort()    // run list.Sort cocurrently; don't wait for it

直接调用literal函数会很方便，因为你很可能在literal函数中引用上下文的其他变量。

    func Announce(message string, delay time.Duration) {
        go func() {
            time.Sleep(delay)
            fmt.Println(message)
        }()   // Note the parentheses - must call the function
    }

在Golang中，literal函数是闭包，Golang会保证他引用的变量，生存到literal函数结束。

上面的代码不是很实用，因为我们无法知道goroutine是否执行完了，也无法从goroutine中拿到我们需要的结果，似乎goroutine无法被外界感知到。为了解决这些问题，我们需要channel

## Channel

Golang提供channel来实现goroutine之间的通信

>Do not communicate by sharing memory; instead, share memory by communicating.

Channel是通过make来创建的

    cj := make(chan int)        // unbuffered channel of integers
    cj := make(chan int, 0)     // unbuffered channel of integers
    cs := make(chan *os.File, 100)      // buffered channel of pointers of Files

Unbuffed channel表示一种同步的通信方式，当channel有人在读的时候，才能往channel里写。写和读时同时发生的。

Channel有很多种常用的用法，如: 等待goroutine结束

    c := make(chan int)
    go func() {
        doSomething()
        c <- 1
    }()

    doSomethingForAWhile()
    <- c // wait for the goroutine to finish; discard the send value

接收者将会阻塞直到有数据到来。如果channel是unbuffered，发送者将会阻塞直到接收者收到数据。如果channel是buffered，发送者将会阻塞直到数据被写入buffer。

Buffered channel可以用做信号量，例如限流

    sem := make(chan int, MaxOut)

    func handle(r *Request) {
        sem <- 1
        process(r)
        <-sem
    }

    func Serve(queue chan *Request) {
        for {
            req := <- queue
            go handle(req)
        }
    }

通过 `sem <- 1`实现限流，但上面的代码有小问题，在每拿到一个请求后，都会创建goroutine交给handle，如果request来的太快，会使消耗的资源快速地增长，简单修改
如下:

    func Serve(queue chan *Request) {
        for req := range queue {
            sem <- 1
            go func() {
                process(req)        // 经典的闭包错误：闭包出在循环中，引用了循环变量，在执行时可能引用到不同循环次数的值
                <-sem
            }()
        }
    }

修改如下：

    func Serve(queue chan *Request) {
        for req := range queue {
            sem <- 1
            go func(r *Request) {
                process(r)
                <-sem
            }(req)
        }
    }


在写server时，还有一个常用的限流的方式，以流量上线为数目创建goroutine，都从request的channal中获取请求，代码如下：

    func handle(queue chan *Request) {
        for req := range queue {
            precess(req)
        }
    }

    func Serve(queue chan *Request, quit chan bool) {
        for i := 0; i < MaxOut; i++ {
            go handle(queue)
        }

        <- quit
    }

没有上面的`<- quit`，上面的Serve会静静地结束，其所起的goroutine也会退出。所以，需要`<- quit`让主goroutine阻塞而不退出，其他goroutine才能正常运行。

### close channel

通过`close(ch)`可以关闭一个channel，等待读此channel的地方都能读到数据。但读到的是什么数据呢？我们先回到，从channel中读数据：

    v := <- ch

实际上是：

    v, more := <- ch

正常收到数据时，v是收到的channel中的数据，more为true。当ch被关闭后, v则是channel中对应数据的zero value，more为false。
即，channel被关闭后，任何已经阻塞着读channel和以后试图读channel的都能读到对应数据的zero value!

所以，常用一个单独的channel，对其close来实现类似quit之类的效果，如

    quit := make(chan int)

    go func(){
        doSomeStuff() 
        ...
        // in some specific situation, call close(quit), then the program exit
    }()

    <- quit

另外，可以通过range来实现，从一个可能被关闭的channel中读出所有正常数据：

    for v := range queue {
        doSomeStuffWith(v) // queue被关闭后zero vaue不会传给v，且queue被close后，for循环也会正常结束
    }

## Select

select是golang提供的多路控制机制，

    select {
    case c <- worker(): // worker() 的evaluate不同于一般语句，worker()调用后回去check下一个case，而不是等到worker()有结果
        ...
    case v := <- c2:
        ...
    ...
    }

实现在多个channel上同时去监听，有一下一些典型应用场景：

    

- 多路合并
- 多路监听
- 超时机制
- 退出机制


多路合并:

    go func() {
        for {
            select {
            case v := <- ch1:
                c <- v
            case v := <- ch2:
                c <- v
            }
        }
    }()

多路检测:

    func doWork() {
        c := make(chan SomeStruct)
        go func() {
            select {
            case c <- replicWork1():
            case c <- replicWork2():
            case c <- replicWork3():
            case c <- replicWork4():
            }
        }()

        return <- c
    }

4个worker做同样的事情，最快有结果的将会被传入channel然后return，其余worker的结果将会被丢弃jjjk

超时机制:

    select {
    case ...:
    ...
    case <- time.After(time.Second * 30):
        doSomeTimeoutAction()
    }

退出机制:

    quit := make(chan int)
    ...
    close(quit)  // sometime that we need to quit

    go func() {
        select {
        case ....:
        ...
        case <- quit:
            doCleanStuff()
            return
        }
    }()

