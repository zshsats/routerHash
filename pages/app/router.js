(function(global) {
    function Router(){
        this.routes = {}; //保存注册的所有路由
        this.beforeFun = null; //切换前
        this.afterFun = null; // 切换后
        this.routeId = "routerView"; // 路由挂载点
        this.redirect = null; // 路由重定向的 hash

    };
    var utils = {
        //获取路由的路径和详细参数
        getParamsUrl: function() {
            var hashDeatail = location.hash.split("?"),
                hashName = hashDeatail[0].split("#")[1],//路由地址
                params = hashDeatail[1] ? hashDeatail[1].split("&") : [],//参数内容
                query = {};
            for(var i = 0;i<params.length ; i++){
                var item = params[i].split("=");
                query[item[0]] = item[1]
            }
            return     {
                path:hashName,
                query:query
            }
        },

        isEmpty: function(obj) {
            var arr = Object.getOwnPropertyNames(obj);
            return arr.length === 0 ? true : false;
        },
        loadHtml:function(url,fn){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader("Content-Type","text/html");
            xhr.onreadystatechange = function () {
                // 请求完成
                var that = this;
                if(xhr.readyState === 4) {
                    if(xhr.status >= 200 && xhr.status <=300 || xhr.status === 304) {
                        fn(xhr.responseText);
                    }
                    else{
                        fn(that);
                    }
                }
            }
            xhr.send();
        },
    };

    Router.prototype = {


        init:function (config) {
            var that = this;
            that.routes = config.routes;
            that.routeId = config.routeId;
            this.redirect = config.redirect;
            //路由切换
            global.addEventListener('hashchange',function(){
                that.urlChange();
            });
            global.addEventListener('load',function(){
                that.urlChange();
            });
        },

        urlChange:function(){
            var that = this;
            var currentHash = utils.getParamsUrl();
            if(currentHash.path){
                that.beforeFun ? that.beforeFun(currentHash) : null;
                that.freshPage(currentHash);
            }else{
                window.location.hash="#"+that.redirect;
            }
        },
        freshPage:function(currentHash){
            var that = this;
            if(!utils.isEmpty(currentHash.query)){
                for(var i = 0 ; i< this.routes.length;i++){
                    var path = this.routes[i].path;
                    var num = path.indexOf(':');
                    var pid = "";
                    if (num>0){
                        pid = path.slice(num+1);
                        utils.loadHtml(that.routes[i].templateUrl,function (htmlData) {
                            if(htmlData){
                                document.getElementById(that.routeId).innerHTML = htmlData;
                            }
                            that.afterFun ? that.afterFun(currentHash) : null;
                        });
                    };
                }
            }else{
                for(var i = 0 ; i< this.routes.length;i++){
                    if(that.routes[i].path===currentHash.path){

                        utils.loadHtml(that.routes[i].templateUrl,function (htmlData) {
                            console.log(htmlData);
                            if(htmlData){
                                document.getElementById(that.routeId).innerHTML = htmlData;
                            }
                            that.afterFun ? that.afterFun(currentHash) : null;
                        });
                    };
                }
            }
        },
        //切换之前的钩子
        beforeEach: function(callback) {
            if (Object.prototype.toString.call(callback) === '[object Function]') {
                this.beforeFun = callback;
            }else{
                console.log("请传入一个函数");
            }
        },
        //切换成功之后的钩子
        afterEach: function(callback) {
            if (Object.prototype.toString.call(callback) === '[object Function]') {
                this.afterFun = callback;
            }else{
                console.log("请传入一个函数");
            }
        }



    };

    global.linkTo =function(url,param){

        var pathUrl = url;
        if(param){
            pathUrl+="/?";
            for (var key in param){
                //只遍历对象自身的属性，而不包含继承于原型链上的属性。
                if (param.hasOwnProperty(key) === true){
                    pathUrl+=key+'='+param[key]+'&';
                }
            }
            pathUrl=pathUrl.slice(0,-1);
        };
        window.location.hash="#"+pathUrl;
    };

    // 注册到 window 全局
    global.Router = Router;
    global.router = new Router();

})(window);