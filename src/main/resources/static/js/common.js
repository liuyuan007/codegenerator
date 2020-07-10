/**
 * 工具封装
 */
var Utils = {
    /**
     * 检查某个元素是否在制定数组(结构中)
     *
     * @param arr
     *            待检查元素
     * @param arrs
     *            目标数组(结构)
     * @param isCold
     *            是否完全相等
     */
    inArray: function (arr, arrs, isCold) {
        isCold = !!isCold;
        for (var key in arrs) {
            if (isCold ? (arrs[key] === arr) : arrs[key] == arr) {
                return true;
            }
        }
        return false;
    },
    /**
     * 判定输入项是否是对象
     *
     * @param obj
     *            待检查者
     *
     */
    isObject: function (obj) {
        return (typeof obj === 'object');
    },
    /**
     * 判断输入项是否是空的
     *
     * @param obj
     *
     */
    isEmptyObject: function (obj) {
        for (var n in obj) {
            return false;
        }
        return true;
    },
    /**
     * 判断输入项是不是数组
     *
     * @param arr
     *
     */
    isArray: function (arr) {
        return typeof arr === 'object' && typeof arr.length === 'number' && !(arr.propertyIsEnumerable('length')) && typeof arr.splice === 'function';
    },
    /**
     * 判断输入项是否为函数
     *
     * @param fun
     *
     */
    isFunction: function (fun) {
        return (typeof fun === 'function');
    },
    /**
     * 判断输入项是否为字符串
     *
     * @param str
     *
     */
    isString: function (str) {
        return (typeof str === 'string');
    },
    /**
     * 判断输入项是否为boolean
     *
     * @param val
     * @returns {Boolean}
     */
    isBoolean: function (val) {
        return (typeof val === "boolean");
    },
    /**
     * 获取datatable里面选中的checkbox的值
     * @param tableId  datatable的id
     * @returns 选中的checkbox的值
     */
    getDataTableCheckIds: function (tableId) {
        var checks = $('#' + tableId + ' input[id!="checkAll"]:checkbox:checked');
        if (checks.length < 1) {
            Alert.errorAutoClose("未选择任何数据");
            return false;
        }
        //序列化返回id
        return checks.serializeArray();
    }
}
var Ajax = {
    form2Json: function (form) {
        return $(form).serializeJSON({
            useIntKeysAsArrayIndex: true,
            parseWithFunction: function (val, inputName) {
                if ($.trim(val) == '') {
                    val = null;
                }
                return val;
            }
        });
    },
    form2JsonStr: function (form) {
        return JSON.stringify(Ajax.form2Json(form))
    },
    obj2JsonStr: function (obj) {
        return JSON.stringify(obj);
    },
    /**
     * 表单转json
     * @param id 表单id
     * @param flag true表示返回json对象，false表示返回json字符串
     * @returns
     */
    formToJSON: function (id, flag) {
        var json = {};
        var arrObj = $("#" + id).serializeArray();
        $.each(arrObj, function () {
            if (json[this.name]) {
                if (!json[this.name].push) {
                    json[this.name] = [json[this.name]];
                }
                json[this.name].push(this.value || '');
            } else {
                json[this.name] = this.value || '';
            }
        });
        if (flag == true) {
            return json;
        } else {
            return JSON.stringify(json);
        }
        return json;
    },
    /**
     * 是否成功
     * @param data 返回的数据
     * @returns {boolean} true表示成功返回状态，false表示错误
     */
    isSuccess: function (data) {
        return  data.status == 1;
    },
    /**
     * 发送AjaxPost请求
     *
     * @param _url
     *            请求路径
     * @param _params
     *            请求参数，可以是a=b&cd、DOM id, json Object
     * @param _callback
     *            回调函数,形如function(jsonObject)
     */
    post: function (_url, _params, _callback, isJson) {
        Ajax._ajax("POST", _url, _params, _callback, isJson, true);
    },

    /**
     * 发送AjaxGet请求(异步,默认异步)
     *
     * @param _url
     *            请求路径
     * @param _params
     *            请求参数，可以是a=b&cd、DOM id, json Object
     * @param _callback
     */
    get: function (_url, _params, _callback, isJson) {
        Ajax._ajax("GET", _url, _params, _callback, isJson, true);
    },
    /**
     * 同步通讯请求
     *
     * @param _url
     * @param _params
     * @param _callback
     */
    sync: function (_url, _params, _callback) {
        Ajax._ajax("POST", _url, _params, _callback, false, false);
    },
    /**
     * post请求，有加载层
     * @param _url 提交url
     * @param _params  参数
     * @param _callback 回调方法
     * @param isJson   是否属于json
     */
    loadingPost: function (_url, _params, _callback, isJson) {
        Ajax._ajax("POST", _url, _params, _callback, isJson, true, true);
    },
    _ajax: function (_type, _url, _params, _callback, isJson, async, isLoading) {
        var loadingIndex = 0;
        $.ajax({
            url: pathRedirect.getWebPath(_url),
            type: _type,
            data: _params,
            dataType: 'json',
            async: async,
            contentType: isJson ? 'application/json;charset=utf-8' : 'application/x-www-form-urlencoded',
            beforeSend: function () {
                //是否展示loadding层
                if (isLoading != undefined && isLoading == true) {
                    loadingIndex = layer.load(0, {shade: 0.01, time: 0});
                }
            },
            success: function (data) {
                var succ = true;
                if (data.status != null && data.status != undefined) {
                    succ = data.status == 1;
                }
                if (!succ) {
                    Alert.error(data.error);
                }
                _callback(data, succ);
            },
            error: function () {
                Alert.error('发起请求时出现错误!');
            },
            complete: function () {
                //关闭loading层
                if (isLoading != undefined && isLoading == true) {
                    layer.close(loadingIndex);
                }
            }
        });
    }
};
/**
 * 警告框
 */
var Alert = {
    lu: {
        confirm: "确定",
        cancel: "取消"
    },

    /**
     * 成功提示(需手动关闭提示框)
     * @param title 标题
     * @param text 显示的内容
     * @param className 弹出框样式
     * @param callback 回调函数
     * @icon  显示的图标
     */
    success: function (title, text,className,callback) {
        if (Utils.isEmptyObject(className)){
            className = 'layui-layer-lan';
        }
        var setting = {
            icon: 1,
            title:title,
            skin:className ,      //样式名称
            closeBtn: 0  ,     //关闭按钮
            anim: 4           //动画类型
        };
        layer.alert(text, setting ,function (index) {
            layer.close(index);
            if ( typeof callback === "function") {
                callback();
            }
        });
    },
    /**
     * 成功提示并自动关闭提示框(开启遮罩，但不可见)
     * @param text 显示的内容
     * @param callback 回调函数
     * @param time 根据多少秒关闭，不填写默认为2秒.单位1000为1秒
     */
    successAutoClose: function ( text, callback, time) {
        if (Utils.isEmptyObject(time) ){
            time = 3000;
        }
        if (Utils.isEmptyObject(text)){
            text = "操作成功";
        }
        var setting = {icon: 1, shade: 0.01, time:time,anim:4};
        layer.msg(text, setting , function(){
            //关闭后的操作
            if (callback) {
                callback();
            }
        } );
    },
    /**
     * 错误提示并自动关闭提示框(开启遮罩，但不可见)
     * @param text 显示的内容
     * @param callback 回调函数
     * @param time 根据多少秒关闭，不填写默认为2秒.单位1000为1秒
     * @param isShock 是否开启震动的弹框，true表示开启，默认开启
     */
    errorAutoClose: function ( text, callback, time,isShock) {
        if (Utils.isEmptyObject(time) ){
            time = 2000;
        }
        if (Utils.isEmptyObject(text)){
            text = "操作失败";
        }
        //震动模式
        if (Utils.isEmptyObject(isShock) ||  isShock == true){
            layer.msg(text, function(){
                //关闭后的操作
                if (callback) {
                    callback();
                }
            });
        }else {
            var setting = {icon: 2, shade: 0.01, time: time};
            layer.msg(text, setting , function(){
                //关闭后的操作
                if (callback) {
                    callback();
                }
            });
        }
    },
    /**
     * 警告提示
     *
     * @param title 标题
     * @param text 显示的内容
     * @param callback 回调函数
     */
    warning: function (title, text, callback, html) {


    },
    /**
     * 确认，取消
     *
     * @param title
     * @param textAgo
     * @param callback
     *            确认后的回调
     */
    confirm : function(title, text, callback, html) {
        swal({
            title : title,
            text : text,
            type : "warning",
            showCancelButton : true,
            confirmButtonText : Alert.lu.confirm,
            cancelButtonText : Alert.lu.cancel,
            confirmButtonColor : "#DD6B55",
            closeOnConfirm : false,
            html : html ? true : false
        }, function(isConfirm) {
            swal.close();
            if (callback) {
                callback(isConfirm);
            }
        });
    },
    /**
     * 错误提示
     * @param title 标题
     * @param text 显示的内容
     * @param callback 回调函数
     */
    error: function ( text, callback) {
        layer.msg( text, {icon:2,anim:6},function (index) {
            layer.close(index);
        },callback);
    },
    /**
     * 错误提示
     * @param title 标题
     * @param text 显示的内容
     * @param callback 回调函数
     */
    errorBlack: function ( text, callback) {
        layer.msg( text, {icon:2,anim:6},function (index) {
            layer.close(index);
        },callback);
    },

    /**
     * 自由定制的提示
     *
     * @param title
     *            提示标题
     * @param text
     *            提示正文
     * @param type
     *            提示类型:success,warning,error
     * @param confirmText
     *            确认按钮文本
     * @param cancelText
     *            取消按钮文本
     * @param callback
     *            确认按钮回调
     */
    free: function (title, text, type, confirmText, cancelText, callback) {
        setTimeout(function () {
            swal({
                title: title,
                text: text,
                type: type,
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                closeOnConfirm: false
            }, function (isConfirm) {
                swal.close();
                if (callback) {
                    callback(isConfirm);
                }
            });
        }, 100);
    },
    /**
     * 打开一个模态窗口
     * @param title  标题
     * @param content  内容（可以填入url）
     * @param height   高（px为单位）
     * @param width    宽（px为单位）
     */
    open: function (title, content, height, width) {
        layer.open({
            type: 2,
            title: title,
            shadeClose: true,
            shade: 0.3,
            maxmin: true, //开启最大化最小化按钮
            area: [height, width],
            content: content
        });
    }
};

