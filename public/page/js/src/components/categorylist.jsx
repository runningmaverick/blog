var React = require('react');
var techData = require('./site-model.js').techData;
var otherData = require('./site-model.js').otherData;
var healthSiteData = require('./health-site-model.js');

var connect = require('react-redux').connect;

var mapStateToProps = function(state) {
    return {conf: state};
};

var mapDispatchToProps = function(dispatch) {
    return {
        onInputChange1: function(e) {
            dispatch({
                type: 'UPDATE_CONF',
                data: {conf1: e.target.value},
            }); 
        }, 
        onInputChange2: function(e) {
            dispatch({
                type: 'UPDATE_CONF',
                data: {conf2: e.target.value},
            }); 
        }, 
        onInputChange3: function(e) {
            dispatch({
                type: 'UPDATE_CONF',
                data: {conf3: e.target.value},
            }); 
        }, 
    };
};

var SiteReducer = function(state={}, action) {
    // Define initialize here !
    if (action.type == 'INIAL') {
        return Object.assign({}, state, {
        
        });
    } else if (action.type == 'UPDATE_CONF') {
        return Object.assign({}, state, action.data);
    } else {
        return state;
    }
};

var SiteList = React.createClass({
    render: function() {
        var nodes = this.props.data.map(function(site) {
            return (
            <div key={site.href} className="col-md-3 col-xs-6 card">
                    <h3><a target="_blank" href={site.href}>{site.name}</a></h3>
                </div>
            );
        }); 
        return (
            <div>{nodes}</div> 
        );
    }, 
});


var CreateCategoryList = function(data) {
    return React.createClass({
        getDefaultProps: function() {
            return {
                data: data,
            };                 
        },
        getInitialState: function() {
            return {data: []};
        },
        componentDidMount: function() {
        },
        render: function() {
            var nodes = this.props.data.map(function(category) {
                return (
                    <div key={category.title}>
                        <div>
                            <div className="col-lg-12">
                                <h2 className="page-header">
                                    {category.title}
                                </h2>
                            </div>
                        </div>
                        <SiteList data={category.content}/>
                    </div>               
                ); 
            }); 

            return (
                <div>
                    <input type="text" value={this.props.conf.conf1} onChange={this.props.onInputChange1}/>
                    <input type="text" value={this.props.conf.conf2} onChange={this.props.onInputChange2}/>
                    <input type="text" value={this.props.conf.conf3} onChange={this.props.onInputChange3}/>
                    <div>{this.props.conf.conf1}</div>
                    <div>{this.props.conf.conf2}</div>
                    <div>{this.props.conf.conf3}</div>
                    <div className="row">{nodes}</div>
                </div>
            );
        },
     
    });
};

var CategoryList = CreateCategoryList(techData);
var NewsCategoryList = CreateCategoryList(otherData);
var HealthCategoryList = CreateCategoryList(healthSiteData); 

module.exports = {
    SiteReducer: SiteReducer,
    CategoryList: connect(mapStateToProps, mapDispatchToProps)(CategoryList),
    NewsCategoryList: connect(mapStateToProps, mapDispatchToProps)(NewsCategoryList),
    HealthCategoryList: connect(mapStateToProps, mapDispatchToProps)(HealthCategoryList),
};
