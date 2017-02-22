<style>
</style>

<template>
        <div>
            <div v-for="category in categories">
                <div>
                    <div class="col-lg-12">
                        <h2 class="page-header">
                            {{category.title}}
                        </h2>
                    </div>
                </div>

                <div v-for="site in category.content" class="col-md-3 col-xs-6 card">
                    <div v-if="site && site.name">
                    <h3><a target="_blank" :href="site.href">{{site.name}}</a></h3>
                    </div>
                </div>
            </div>               
        </div>               
</template>

<script>
var healthData = require('./health-site-model.js');

module.exports =  {
    data: function() {
        return { categories: healthData };
    },
}
</script>


