var techData = require('./components/site-model.js').techData;
var otherData = require('./components/site-model.js').otherData;
var healthSiteData = require('./components/health-site-model.js');
var VueRouter = require('vue-router');
var Vue = require('vue');
var sitesTpl = require('./components/sites.vue');

var state = {categories: techData}

Health = Object.assign({}, sitesTpl, {
    data: function() {
        // Value by reference changed will update view automaticly
        return {categories: healthSiteData}; 
    }
});
News = Object.assign({}, sitesTpl, {
    data: function() {
        return {categories: otherData}; 
    }
});
Tech = Object.assign({}, sitesTpl, {
    data: function() {
        return {categories: techData}; 
    }
});

Vue.use(VueRouter);

const routes = [
    {path: '/index', component: Tech, }, 
    {path: '/news', component: News, }, 
    {path: '/health', component: Health, }, 
]; 
state.categories = healthSiteData;
const router = new VueRouter({ routes });
const app = new Vue({
      router
}).$mount('#vue-app');


