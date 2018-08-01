
var Global = {};
Global.isDev = true;
Global.context = "/LogitechCube";
Global.fileContext = Global.isDev ? Global.context : "/pageFile";
Global.contextPath = document.location.protocol + "//" + document.location.host + Global.context;

/**
* 日期：2016-11-14
* 作者：Feily
* 描述：公共业务服务类
*/
var commonService = (function() {

	var _className = "commonService";

	/**
	 * 异步请求
	 * @param url string 请求url
	 * @param data json 请求参数对象，默认为空
	 * @param successCallback funciton 执行成功回调函数，默认为记录返回对象日志
	 * @param errorCallback funciton 执行失败回调函数，默认为弹出返回错误信息
	 * @param async boolean 是否异步，默认为true
	 * @param dataType string 返回数据类型，默认为json
	 * @param method string 请求方法，默认为post
	 */
	var _ajax = function(url, data, successCallback, errorCallback, async, dataType, method) {
		logService.logMethodCalled("_ajax", _className);

		if (async == undefined) {
			async = true;
		}
		dataType = dataType || "json";
		method = method || "post";

		var params = {};
		params.url = url;
		if(JSON.stringify(data).length < 1000){
			params.data = data;
		}

		params.async = async;
		params.dataType = dataType;
		params.method = method;
		logService.logParamValue("_ajax.params", params, _className);

		$.ajax({
			type : method,
			url : url,
			async : async,
			data : data,
			dataType : dataType, 
			success : function(response) {
				if(response&&response.subCode==30004){
					top.window.location=response.data;
				}
				
				if (typeof (successCallback) == "function") {
					logService.logParamValue("response", response, _className);
					successCallback(response);
				} else {
					logService.logError(response);
				}
			},
			error : function(response) {
				 
            		 
				if (typeof (errorCallback) == "function") {
					errorCallback(response);
				} else {
					if (typeof (response) == "object") {
						response = JSON.stringify(response);
					}
				}
			}
		});
	}

	/**
	 * 模拟表单提交
	 * @param url string 请求url
	 * @param data json 请求参数对象，默认为空
	 * @param target string 请求目标，默认为空
	 */
	var _submit = function(url, data, target) {
		var tempform = document.createElement("form");
		tempform.action = url;
		tempform.method = "post";
		tempform.style.display = "none"
		if (target) {
			tempform.target = target;
		}

		for (var x in data) {
			var opt = document.createElement("input");
			opt.name = x;
			opt.value = data[x];
			tempform.appendChild(opt);
		}

		var opt = document.createElement("input");
		opt.type = "submit";
		tempform.appendChild(opt);
		document.body.appendChild(tempform);
		tempform.submit();
		document.body.removeChild(tempform);
	}

	/**
	 * 获取URL请求参数集
	 *
	 * @return json 参数集
	 */
	var _getQueryString = function() {
		if (window.location.search == "") {
			return {
				"" : "无URL参数"
			};
		}
		var q = window.location.search.substring(1).split("&");
		var returnValue = {};
		for (var i = 0; i < q.length; i++) {
			var temp = q[i].split("=");
			returnValue[temp[0]] = decodeURI(temp[1]); //encodeURI()是用来对URL编码的函数。 编码整个url地址，但对特殊含义的符号"; / ? : @ & = + $ , #"不进行编码。对应的解码函数是：decodeURI()。
			// alert(decodeURI(temp[1]));
		}
		return returnValue;
	}

	/**
	 * 根据参数名获取URL请求参数
	 * @param name string 参数名称
	 * @return string 参数值
	 */
	var _getQueryStringByName = function(name) {
		var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
		if (result == null || result.length < 1) {
			return "";
		}
		return decodeURI(result[1]);
	}

	/**
	 * 把JSON格式数据转换为url参数，并给给URL加上时间戳
	 * @param url string 原始url
	 * @param paramObject json 参数集
	 * @param addRandomCode bool 是否时间戳
	 * @return string 转换为URL
	 */
	var _buildUrl = function(url, paramObject, addRandomCode) {
		logService.logMethodCalled("_buildUrl", _className);
		addRandomCode = addRandomCode || true;

		var params = {};
		params.url = url;
		params.paramObject = paramObject;
		params.addRandomCode = addRandomCode;
		logService.logParamValue("_buildUrl.params", params, _className);

		if (paramObject) {
			if (addRandomCode) {
				paramObject.randomCode = new Date().valueOf();
			}
			var queryString = "";
			for ( var attr in paramObject) {
				var value = paramObject[attr];
				if (queryString.length > 0) {
					queryString += "&";
				}
				queryString += attr + "=" + encodeURI(value);
			}
			if (queryString.length > 0) {
				if (url.indexOf("?") >= 0) {
					url = url + "&" + queryString;
				} else {
					url = url + "?" + queryString;
				}
			}
		}
		
		if(url.charAt(0) == "/" && url.substr(0, Global.context.length) != Global.context){
			url = Global.context + url;
		}
		return url;
	}

	/**
	 * 获取表单值
	 * @param formId string 表单的ID，如果不存在，则默认为第一个表单
	 * @return json
	 */
	var _getForm = function(formId,fileInputId) {
		logService.logMethodCalled("_getForm", _className);
		logService.logParamValue("formId",formId);

		var select = "form";
		if(fileInputId){
			fileInputId = fileInputId;
		}
		if (formId) {
			select = "#" + formId;
		}

		var data = {};
		var t = $(select).serializeArray();
		
		//serializeArray无法将input[file]的数值转化至数组，这里进行一次转化
		var fileObj = {name:"", value:""};
		console.log(fileInputId);
		if(fileInputId != undefined){
			var objmy = document.getElementById(fileInputId).files;
			if(objmy.length == 0){
				fileObj.name = fileInputId;
				fileObj.value = "";
				t.push(fileObj);
			}else{
				for(i=0;i<objmy.length;i++){
					fileObj.name = fileInputId;
					fileObj.value = objmy[i].name;
					t.push(fileObj);
				}
			}
		}
		$.each(t, function() {
				var key = this.name || this.id;
				// 主要针对下拉多选，每次只能取一个value
				if(data[key]){
					data[key] = data[key] + ',' +this.value;
				}else{
					data[key] = this.value;
				}
			});
		return data;
	}

	/**
	 * 填充表单值
	 *
	 * @param data
	 *            json 表单值集合
	 */
	var _fillForm = function(data) {
		logService.logMethodCalled("_fillForm", _className);
		logService.logParamValue("data", data);

		var obj = data || {};
		var key, value, tagName, type, arr;
		for (x in obj) {
			key = x;
			value = obj[x];
            if(!value && value!= 0){
            	continue;
            }
			$("[name='" + key + "'],[name='" + key + "[]'], [id='" + key + "'],[id='" + key + "[]']").each(function() {
				if($(this).attr("ui-type")){
					var uiType = $(this).attr("ui-type");
					switch (uiType) {
		                case 'suggest':	// 自动完成
							uiSuggest.setValue(key, value);
							break;
		                case 'selector': // 弹出选择
							uiSelector.setValue(key, value);
		                    break;
		                case 'file': 	// 文件上传
							uiFile.setValue(key, value);
							break;
						case 'date': 	// 日期选择
							uiDate.setValue(key, value);
							break;
						case 'select':	// 下拉选择
							uiSelect.setValue(key, value);
							break;
						case 'chosen': 	// 建议选择
							uiChosen.setValue(key, value);
							break;
						case 'image':	// 图片上传
							uiImage.setValue(key, value);
							break;
						case 'ueditor': // 富文本编辑
							uiUeditor.setValue(key, value);
							break;
						default:
							logService.logError("属性值出错", _className);
					}
				}else{
					tagName = $(this)[0].tagName;
					type = $(this).attr('type');
					if (tagName == 'INPUT') { //tagName 属性的返回值始终是大写的
						if (type == 'radio') { //radio 单选按钮
							$(this).attr('checked', $(this).val() == value); //val() 方法返回或设置被选元素的值
						} else if (type == 'checkbox') {
							arr = value.split(',');
							for (var i = 0; i < arr.length; i++) {
								if ($(this).val() == arr[i]) {
									$(this).attr('checked', true);
									break;
								}
							}
						} else {
							$(this).val(value);
						}
					} else if (tagName == 'SELECT' || tagName == 'TEXTAREA') {
						value = value.toString();
						$(this).val(value);
					}
				}

				logService.logMessage(key + ' = ' + $(this).val());
			});
		}
	}

	/**
	 * 重定向首页
	 */
	var _backhome = function(){
		window.top.location.href = Global.contextPath;
	}
	
	/**
	 * 删除数据
	 *
	 * @param ids string 数据ID值
	 * @param deleteCallback function 删除回调方法
	 * @param content string 确定提醒内容，默认为 '您确定要删除选择数据吗？'
	 */
	var _deleteDataById = function(ids, deleteCallback, content){
		if (ids) {
			content = content || '您确定要删除选择数据吗？';
			layerService.confirm(content, {title:'删除确认'}, function() {
				deleteCallback(ids);
				layerService.closeAll('dialog');
			});
		}else{
			noticeService.warnNotice("请至少选择一条数据");
		}
	}

	/**
	 * 删除数据，不推荐使用
	 *
	 * @param gridTableId string gridviewID
	 * @param ids string 数据ID值
	 * @param deleteCallback function 删除回调方法
	 */
	var _deleteData = function(gridTableId, ids, deleteCallback, content){

		if(gridTableId){
			ids = gridService.getSelectedRows(gridTableId);
			if (ids == "") {
				noticeService.warnNotice("请至少选择一条数据");
				return;
			}
		}
		content = content||'您确定要删除选择数据吗？';
		layerService.confirm(content, {title:'删除确认'}, function() {
			deleteCallback(ids);
			layerService.closeAll('dialog');
		});
	}
	
	/**
	 * 删除数据
	 *
	 * @param gridTableId string gridviewID
	 * @param url string 导出处理Ation的URL
	 */
	var _exportData = function(gridTableId, url) {

		var data = {};

		var ids = gridService.getSelectedRows(gridTableId);
		if (ids == "") {
			layerService.confirm('请您确定导出方式？', {
						title : '导出确认',
						btn : ['当前页', '全部页']
					}, function() {

						data.exportType = "page";
						url = _buildUrl(url, data);
						gridService.excelExport(gridTableId, url);

						layerService.closeAll('dialog');
					}, function() {

						data.exportType = "all";
						url = _buildUrl(url, data);
						gridService.excelExport(gridTableId, url);

					});
		} else {
			layerService.confirm('请您确定导出方式？', {
						title : '导出确认',
						btn : ['所选数据', '当前页']
					}, function() {

						data.exportType = "select";
						data.SelectedIds = ids;
						url = _buildUrl(url, data);
						gridService.excelExport(gridTableId, url);

						layerService.closeAll('dialog');
					}, function() {

						data.exportType = "page";
						url = _buildUrl(url, data);
						gridService.excelExport(gridTableId, url);
					});
		}
	}

	/**
	 * 将时间戳转化为日期格式
	 * @param timeStamp 时间戳
	 * @param formatStr 返回的日期格式，如yyyy-mm-dd
	 * 	格式 YYYY/yyyy/YY/yy 表示年份
	 *		MM/M 月份
	 *		W/w 星期
	 *		dd/DD/d/D 日期
	 *		hh/HH/h/H 时间
	 *		mm/m 分钟
	 *		ss/SS/s/S 秒
	 */
	var _getTimeFormat = function(timeStamp, formatStr) {
		logService.logMethodCalled("_getTimeFormat", _className);
		logService.logParamValue("timeStamp",timeStamp);

		formatStr = formatStr || 'yyyy-MM-dd';
		var date = new Date(parseInt(timeStamp));
		var str = formatStr;
	    var Week = ['日','一','二','三','四','五','六'];

	    str=str.replace(/yyyy|YYYY/,date.getFullYear());
	    str=str.replace(/yy|YY/,(date.getYear() % 100) > 9 ? (date.getYear() % 100).toString():'0' + (date.getYear() % 100));	

	    str=str.replace(/MM/,(date.getMonth() + 1) > 9 ? (date.getMonth()+1).toString() :'0' + (date.getMonth() + 1));
	    str=str.replace(/M/g,(date.getMonth()+1));

	    str=str.replace(/w|W/g,Week[date.getDay()]);

	    str=str.replace(/dd|DD/,date.getDate()>9?date.getDate().toString():'0' + date.getDate());
	    str=str.replace(/d|D/g,date.getDate());

	    str=str.replace(/hh|HH/,date.getHours()>9?date.getHours().toString():'0' + date.getHours());
	    str=str.replace(/h|H/g,date.getHours());
	    str=str.replace(/mm/,date.getMinutes()>9?date.getMinutes().toString():'0' + date.getMinutes());
	    str=str.replace(/m/g,date.getMinutes());

	    str=str.replace(/ss|SS/,date.getSeconds()>9?date.getSeconds().toString():'0' + date.getSeconds());
	    str=str.replace(/s|S/g,date.getSeconds());

	    return str;
	}

	/**
	 * 初始化参数，将JSON格式的字符串转化为JSON对象
	 * @param parameters string 参数
	 * @return JSON {"value1": "text1", ...}
	 */
    var _initParameter = function(parameters) {
		logService.logMethodCalled("_initParameter");

	    var returnValue = {};

	    if (typeof (parameters) == "object") {
	        returnValue = parameters;
	    }
	    if (typeof (parameters) == "string") {
	    	if(eval('(' + parameters + ')')){
	    		returnValue = eval('(' + parameters + ')');
	    	}else{
	    		var keyValueSet = parameters.split(",");
		        for (var i = 0; i < keyValueSet.length; i++) {
		            var keyValue = keyValueSet[i].split(":");
		            returnValue[keyValue[0]] = keyValue[1];
		        }
	    	}
	    }
	    return returnValue;
	}

	/**
	 * 获取文件上传公共页面路径
	 * @param data json 参数集
	 * @param callback 回调函数
	 * @param title 弹出层页面标题
	 * @param height 弹出层高度
	 * @param width 弹出层宽度
	 * @param commonPageUrl string 公共页面URL
	 */
	var _openUploadFileDialog = function(data, callback, title, height, width, commonPageUrl){
		logService.logMethodCalled("_openUploadFileDialog");

		data = data || {};
		height = height || '800px';
		width = width || '400px';
		title = title || "文件上传";
		commonPageUrl = commonPageUrl || Global.contextPath + '/base/ui/uiFile.html';
		var url = commonService.buildUrl(commonPageUrl, data);

		if (typeof (callback) == "function") {
			modalDialogService.openModalDialog(url, callback, height, width, title);
		} else {
			logService.logError(callback + ' 不是函数');
		}
	}

	/**
	 * 获取图片编辑公共页面路径
	 * @param data json 参数集
	 */
	var _openEditImageDialog = function(data, callback, title, height, width){
		logService.logMethodCalled("_openEditImageDialog");
		data = data || {};
		height = height || '540px';
		width = width || '600px';
		title = title || "图片编辑";
		
		var url = commonService.buildUrl(Global.contextPath+'/base/ui/uiImageEdit.html', data);
		
		if (typeof (callback) == "function") {
			modalDialogService.openModalDialog(url, callback, height, width, title);
		} else {
			logService.logError(callback + ' 不是函数');
		}
	}

	/**
	 * 判断对象是否为空
	 * @ param e object 对象
	 * @return true(为空)/false(不为空)
	 */
	var _isEmptyObject = function(e) {
		logService.logMethodCalled("_isEmptyObject", _className);
		logService.logParamValue("e", e);

	    var t;
	    for (t in e)
	        return !1;
	    return !0
	}

	// 对外调用方法
	return {

		// 异步请求
		ajax : _ajax,

		// 模拟表单提交
		submit : _submit,

		// 获取URL请求参数集
		getQueryString : _getQueryString,

		// 根据参数名获取URL请求参数
		getQueryStringByName : _getQueryStringByName,

		// 把JSON格式数据转换为URL参数，并给给URL加上时间戳
		buildUrl : _buildUrl,

		// 获取表单值
		getForm : _getForm,

		// 填充表单值
		fillForm : _fillForm,

		// 重定向首页
		backhome : _backhome,

		// 根据数据ID删除数据
		deleteDataById : _deleteDataById,

		// 根据表格ID删除数据
		deleteDataByGridTableId : function(gridTableId, deleteCallback,content){
			_deleteData(gridTableId, "", deleteCallback,content);
		},

		// 将时间戳转化为日期格式
		getTimeFormat: _getTimeFormat,

		// 将JSON格式的字符串(如：'"value1": "text1", ...'等)转化为JSON对象
		initParameter: _initParameter,

		// 获取文件上传公共页面路径
		openUploadFileDialog: _openUploadFileDialog,

		// 获取图片编辑公共页面路径
		openEditImageDialog: _openEditImageDialog,

		// 判断对象是否为空
		isEmptyObject: _isEmptyObject,
		
		//导出excel
		exportData : _exportData
	}

})();

/**
* 日期：2016-12-08
* 作者：Feily
* 描述：模态框业务服务类
*/
var modalDialogService = (function() {

	var _className = "modalDialogService";

	/**
	 * 弹出模态窗口
	 * @param url string Iframe页面的url
	 * @param successCallback funciton 执行成功回调函数，默认不做任何操作
	 * @param width string 弹出层宽度，默认为'800px'
	 * @param height string 弹出层高度，默认为'460px'
	 * @param title string 弹出层标题，默认为空
	 * @param isFull boolean 是否全屏打开，默认为false
	 * @param fullCallback funciton 执行成功回调函数，默认刷新iframe
	 * @return 一个当前层索引
	 */
	var _openModalDialog = function(url, successCallback, width, height, title, isFull, fullCallback) {
		logService.logMethodCalled("_openModalDialog", _className);

		successCallback = successCallback || function (res) { };
		fullCallback = fullCallback || function() {};

		var index = -1;
		window.top.layui.use('layer', function() { 
			var $ = window.top.layui.jquery, layer = window.top.layui.layer; //第三方插件layui
			width = width || '800px';
			height = height || '600px';
			title = title || '';

			var params = {
				type : 2, //type - 基本层类型 类型：Number，默认：0 layer提供了5种层类型。可传入的值有：0（信息框，默认）1（页面层）2（iframe层）3（加载层）4（tips层）。 若你采用layer.open({type: 1})方式调用，则type为必填项（信息框除外）
				area : [ width, height ], //area - 宽高 类型：String/Array，默认：'auto' 在默认状态下，layer是宽高都自适应的，但当你只想定义宽度时，你可以area: '500px'，高度仍然是自适应的。当你宽高都要定义时，你可以area: ['500px', '300px']

				shadeClose : false,   //shadeClose - 是否点击遮罩关闭 类型：Boolean，默认：false 如果你的shade是存在的，那么你可以设定shadeClose来控制点击弹层外区域关闭。
				content : url,
				title : title,
				full: fullCallback, //full/min/restore -分别代表最大化、最小化、还原 后触发的回调类型：Function，默认：null 携带一个参数，即当前层DOM
				maxmin : false, //maxmin - 最大最小化。类型：Boolean，默认：false 该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
				scrollbar: false 
			};
			logService.logParamValue("_openModalDialog.params", params, _className);

			var index = layer.open(params);
			_addModalDialog(index, successCallback);
			
			if(isFull){
				params.maxmin = false;
				layer.full(index);	
			}

			return index;
		});
	}

	/**
	 * 新增模态窗口对象
	 * @param index int 窗口索引
	 * @param successCallback funciton 执行成功回调函数，默认不做任何操作
	 */
	var _addModalDialog = function(index, successCallback){

		var modalDialog = {};
		modalDialog.modalDialogIndex = index;
		modalDialog.successCallback = function(res) {
			if (successCallback && typeof(successCallback) == 'function') {
				successCallback(res);
			}
		};

		// 新增模态框对象
		_getModalDialogs().push(modalDialog);
	}

	/**
	 * 关闭模态窗口
	 * @param res 返回参数值
	 */
	var _closeModalDialog = function(res){
		logService.logMethodCalled("_closeModalDialog", _className);
		logService.logParamValue("res", res);

		// 最后一个模态窗口
		var modalDialog = _getModalDialogs().pop();
		if(modalDialog){
			modalDialog.successCallback(res);

			_close(modalDialog.modalDialogIndex);

		}
	}

	/**
	 * 取消模态窗口
	 */
	var _cancelModalDialog = function(){
		logService.logMethodCalled("_cancelModalDialog", _className);

		// 最后一个模态窗口
		var modalDialog = _getModalDialogs().pop();
		if(modalDialog){
			_close(modalDialog.modalDialogIndex);
		}
	}

	/**
	 * 获取模态窗口对象列表
	 */
	var _getModalDialogs = function(){
		if (!window.top.modalDialogs || window.top.modalDialogs.length == 0) {
            window.top.modalDialogs = [];
        }
    	logService.logParamValue("_modalDialogs",window.top.modalDialogs, _className)
		return window.top.modalDialogs;
	}

	/**
	 * 关闭模态窗口
	 * @param index
	 */
	var _close = function(index){
		window.top.layui.use('layer', function() {
			var $ = window.top.layui.jquery, layer = window.top.layui.layer;
			layer.close(index);
		})
	}

	// 对外调用方法
	return {

		// 弹出模态窗口
		openModalDialog : _openModalDialog,

		// 关闭模态窗口
		closeModalDialog : _closeModalDialog,

		// 取消模态窗口
		cancelModalDialog : _cancelModalDialog
	}

})();

/**
* 日期：2016-11-15
* 作者：Feily
* 描述：层服务类
*/
var layerService = (function() {
	var _className = "layerService";
	
	/**
	 * 弹出HTML页面层
	 * @param htmlContent string html格式内容，如\<\div style="padding:20px;">自定义内容\<\/div>
	 * @param width string 弹出层宽度，默认为'800px'
	 * @param height string 弹出层高度，默认为'460px'
	 * @param isShadeClose boolean 是否点击遮罩关闭层，默认为true
	 * @param isFull 是否全拼打开，默认为false
	 * @return 一个当前层索引
	 */
	var _openHtml = function(htmlContent, width, height, isShadeClose, isFull) {
		logService.logMethodCalled("_openHtml", _className);
		layui.use('layer', function() {
			var layer = layui.layer;
			htmlContent = htmlContent || '\<\div style="padding:20px;">无内容\<\/div>';
			width = width || '800px';
			height = height || '460px';
			if (isShadeClose == undefined) {
				isShadeClose = true;
			}

			var params = {
				type : 1,
				area : [ width, height ],
				shadeClose : isShadeClose,
				content : htmlContent
			};
			logService.logParamValue("_openHtml.params", params, _className);
			
			var index = layer.open(params);
			if(isFull){
				params.maxmin = false;
				index = layer.full(index);
			}
			return index;
		})
	}

	/**
	 * 弹出Iframe层
	 * @param url string Iframe页面的url
	 * @param width string 弹出层宽度，默认为'800px'
	 * @param height string 弹出层高度，默认为'460px'
	 * @param title string 弹出层标题，默认为空
	 * @param isShadeClose boolean 是否点击遮罩关闭层，默认为false
	 * @param isFull 是否全拼打开，默认为false
	 * @return 一个当前层索引
	 */
	var _openIframe = function(url, width, height, title, isShadeClose, isFull) {
		logService.logMethodCalled("_openIframe", _className);
		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			width = width || '800px';
			height = height || '460px';
			title = title || '';
			if (isShadeClose == undefined) {
				isShadeClose = false;
			}

			var params = {
				type : 2,
				area : [ width, height ],
				shadeClose : isShadeClose,
				content : url,
				title : title,
				maxmin : true,
				scrollbar: false
			};
			logService.logParamValue("_openIframe.params", params, _className);

			var index = layer.open(params);
			if(isFull){
				params.maxmin = false;
				index = layer.full(index);
			}
			return index;
		});
	}

	/**
	 * 弹出加载层
	 * @param icon int 默认为1
	 * @param options json 配置，默认为{}
	 * @return 一个当前层索引
	 */
	var _load = function(icon, options) {
		logService.logMethodCalled("_load", _className);
		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			icon = icon || 1;
			options = options || {};

			return layer.load(icon, options);
		})

	}

	/**
	 * 弹出吸附层
	 * @param content string 消息
	 * @param follow string 目标控件Id，如"#id"
	 * @param options json 配置，默认为{}
	 * @return 一个当前层索引
	 */
	var _tips = function(options, follow, options) {
		logService.logMethodCalled("_tips", _className);
		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			options = options || {};

			return layer.tips(content, follow, options);
		})

	}

	/**
	 * 弹出提示层,默认3秒关闭
	 * @param content string 消息
	 * @param options json 配置，默认为{}
	 * @param end function 关闭的回调方法
	 * @return 一个当前层索引
	 */
	var _message = function(content, options, end) {
		logService.logMethodCalled("_message", _className);
		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			options = options || {};

			return layer.msg(content, options, end);
		})

	}

	/**
	 * 弹出警告层
	 * @param content string 消息
	 * @param options json 配置，默认为{}
	 * @param yes function 关闭的回调方法
	 * @return 一个当前层索引
	 */
	var _alert = function(content, options, yes) {
		logService.logMethodCalled("_alert", _className);
		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			options = options || {};

			return layer.alert(content, options, yes);
		})

	}

	/**
	 * 弹出询问层
	 * @param content string 消息
	 * @param options json 配置，默认为{}
	 * @param yes function 确定的回调方法
	 * @param cancel function 取消的回调方法
	 * @return 一个当前层索引
	 */
	var _confirm = function(content, options, yes, cancel) {
		logService.logMethodCalled("_confirm", _className);
		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			options = options || {};

			return layer.confirm(content, options, yes, cancel);
		})

	}

	/**
	 * 关闭特定层
	 * @param index string 层索引
	 */
	var _close = function(index) {
		logService.logMethodCalled("_close", _className);

		layui.use('layer', function() {
			var $ = layui.jquery, layer = layui.layer;
			layer.close(index);
		})

	}

	/**
	 * 关闭特定类型层
	 * @param type string 类型，默认为空，关闭所有层，可选值{'dialog','page','iframe','loading','tips'}
	 */
	var _closeAll = function(type) {
		logService.logMethodCalled("_closeAll", _className);

		type = type || "";

		layer.closeAll(type);
	}

	// 对外调用方法
	return {

		// 弹出HTML页面层
		openHtml : _openHtml,

		// 弹出Iframe层
		openIframe : _openIframe,

		// 弹出加载层
		load : _load,

		// 弹出吸附层
		tips : _tips,

		// 弹出提示层
		message : _message,

		// 弹出警告层
		alert : _alert,

		// 弹出询问层
		confirm : _confirm,

		// 关闭特定层
		close : _close,

		// 关闭特定类型层
		closeAll : _closeAll
	}

})();

/**
* 日期：2016-11-16
* 作者：Feily
* 描述：树服务类
*/
var treeService = (function() {
	var _className = "treeService";
	var _loadDataUrl = "";

	/**
	 * 初始化树
	 * @param treeId string 树容器Id，
	 * @param loadDataUrl string 数据加载url
	 * @param activate function 树点击回调方法
	 * @param lazyLoad function 树点击回调方法，默认根据url实现
	 * tips  更多案例api请参考 http://wwwendt.de/tech/fancytree/doc/jsdoc/global.html#EventData
	 */
	var _initTree = function(treeId, loadDataUrl, activate, lazyLoad,showCheckBox,createNode,selectedId) {
		logService.logMethodCalled("_initTree", _className);
		showCheckBox = showCheckBox || false;
		treeId = "#" + treeId;

		logService.logParamValue("treeId", treeId);
		logService.logParamValue("loadDataUrl", loadDataUrl);

		_loadDataUrl = loadDataUrl;

		if (typeof (lazyLoad) != "function") {
			lazyLoad = _lazyLoad;
		}
		$(treeId).fancytree({
			source : $.ajax({
				url : loadDataUrl, //接口
				dataType : "json"//数据类型
			}),
			//extensions : [ "glyph", "wide" ], //扩展 glyph字体库， wide控制字体库大小
			minExpandLevel : 1, //顶级节点是不可折叠
			checkbox:showCheckBox,
			// 点击事件
			activate : activate,
			// 成功初始化后执行方法
			createNode:createNode,
			init:function(){
				var tree = $(treeId).fancytree("getTree"),
			      activeNode = tree.getActiveNode();
				  tree.visit(function(node){
				    	node.setExpanded(true);
				  });
			},
			//点击获取id
			select: function(event, data) {
				// Display list of selected nodes
				var selNodes = data.tree.getSelectedNodes();
				// convert to title/key array
				var selKeys = $.map(selNodes, function(node){
					   return node.key;
					});
				$("#"+selectedId).val(selKeys.join(", "));
			},
			// 动态加载事件
			lazyLoad : lazyLoad
		});

	}

	/**
	 * 默认动态加载数据
	 * @param event
	 * @param data
	 */
	var _lazyLoad = function(event, data) {
		logService.logMethodCalled("_lazyLoad", _className);

		var node = data.node;
		data.result = {
			url : _loadDataUrl,
			data : {
				parentId : node.key
			},
			debugDelay : 200
		};
	}

	// 对外调用方法
	return {

		// 初始化树
		initTree : _initTree
	}

})();

/**
 * 日期：2016-11-15 作者：Feily 描述：通知服务类
 */
var noticeService = (function() {

	var _className = "noticeService";
	var _isInit = false;

	/**
	 * 初始化参数
	 */
	var _initToastr = function(config) {
		if (!_isInit) {
			logService.logMethodCalled("_initToastr", _className);
			var defaultConfig = {
				closeButton : true, //关闭按钮
				debug : false, 
				progressBar : true, //进度条
				positionClass : "toast-top-right", //位置类 右上方
				onclick : null,
				showDuration : "400", //显示时间
				hideDuration : "1000",//隐藏时间
				timeOut : "7000",	//超时时间
				extendedTimeOut : "1000", //延长超时
				showEasing : "swing", //显示宽松 摇摆不定
				hideEasing : "linear", //隐藏宽松  线性
				showMethod : "fadeIn", //显示方法 渐显
				hideMethod : "fadeOut", //隐藏方法  淡出
				tapToDismiss: false  //??
			}

			for ( var key in defaultConfig) {
				if (config == undefined) {
					config = {};
					config[key] = defaultConfig[key];
				}else{
					config[key] = defaultConfig[key];
				}
			}
			toastr.options = config;
		}

		_isInit = true;
	}

	/**
	 * 弹出成功通知
	 * @param message string 消息
	 * @param title string 标题，默认为空
	 */
	var _successNotice = function(message, title) {
		logService.logMethodCalled("_successNotice", _className);

		_notice(message, title, "success");
	}

	/**
	 * 弹出警告通知
	 * @param message string 消息
	 * @param title string 标题，默认为空
	 */
	var _warnNotice = function(message, title) {
		logService.logMethodCalled("_warnNotice", _className);

		_notice(message, title, "warning");
	}

	/**
	 * 弹出错误通知
	 * @param message string 消息
	 * @param title string 标题，默认为空
	 */
	var _errorNotice = function(message, title) {
		logService.logMethodCalled("_errorNotice", _className);

		_notice(message, title, "error");
	}

	/**
	 * 弹出通知
	 * @param message string 消息
	 * @param title string 标题，默认为空
	 * @param type string 类型，可以取值{error,info,success,warning}
	 */
	var _notice = function(message, title, type) {
		// 初始化参数
		_initToastr();

		toastr[type](message, title);
	}

	// 对外调用方法
	return {
		initToastr: _initToastr,

		// 成功通知
		successNotice : _successNotice,

		// 警告通知
		warnNotice : _warnNotice,

		// 错误通知
		errorNotice : _errorNotice,

		// 通知
		notice : _notice
	}

})();

/**
* 日期：2016-11-10
* 作者：Feily
* 描述：日志服务类
*/
var logService = (function() {

	// 是否记录日志
	var _isLog = Global.isDev;

	/**
	 * 记录方法调用日志
	 * @param methodName 方法名称
	 * @param className 类名称，默认为空
	 */
	var _logMethodCalled = function(methodName, className) {
		if (!_isLog)
			return;

		className = className || "";
		if (className) {
			methodName = className + "." + methodName;
		}

		var message = "【函数】" + methodName + " 被调用";
		_logMessage(message);
	}

	/**
	 * 记录参数值日志
	 * @param methodName 方法名称
	 * @param className 类名称，默认为空
	 */
	var _logParamValue = function(paramName, paramValue, className) {
		if (!_isLog)
			return;

		className = className || "";
		if (className) {
			paramName = className + "." + paramName;
		}

		if (typeof (paramValue) == "object") { //typeof返回一个用来表示表达式的数据类型的字符串
			paramValue = JSON.stringify(paramValue); //stringify()用于从一个对象解析出字符串  parse()用于从一个字符串中解析出json对象
		}

		var message = "【参数】" + paramName + "：" + paramValue;
		//_logMessage(message);
	}

	/**
	 * 记录消息日志
	 * @param message 消息
	 */
	var _logMessage = function(message) {
		if (!_isLog)
			return;

		//console.info(message);
	}

	/**
	 * 记录异常日志
	 * @param error 错误
	 * @param className 类名称，默认为空
	 */
	var _logError = function(error, className) {
		if (typeof (error) == "object") {
			error = JSON.stringify(error);
		}

		className = className || "";
		if (className) {
			console.error("【异常】" + className + ":" + error);
		} else {
			console.error("【异常】" + error);
		}
	}

	// 对外调用方法
	return {

		// 记录方法调用日志
		logMethodCalled : _logMethodCalled,

		// 记录参数值日志
		logParamValue : _logParamValue,

		// 记录消息日志
		logMessage : _logMessage,

		// 记录异常
		logError : _logError
	}

})();

/**
* 日期：2016-12-4
* 作者：Zhudc
* 描述：换肤
*/
var themesDataService = (function() {

	/**
	 * 保存Cookie
	 * @param name 名称
	 * @param value 值
	 * @param expiredays 保存时长
	 */
	var _setCookie = function(name, value, expiredays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + expiredays);
		document.cookie = name + "=" + escape(value) + ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString());
	}

	/**
	 * 获取Cookie
	 * @param name 名称
	 */
	var _getCookie = function(name) {
		if (document.cookie.length > 0) {
			var c_start = document.cookie.indexOf(name + "=");
			if (c_start != -1) {
				c_start = c_start + name.length + 1;
				var c_end = document.cookie.indexOf(";", c_start);
				if (c_end == -1) {
					c_end = document.cookie.length;
				}
				return unescape(document.cookie.substring(c_start, c_end)); //unescape() 函数可对通过 escape() 编码的字符串进行解码。
			}
		}
		return "";
	}

	/* ifreme递归 */
	/**
	 * ifreme递归
	 * @param winiframe 顶层iframe
	 * @param cssPath 风格路径
	 */
	// var _changeSkin = function(winiframe, cssPath) {
	// 	var href = winiframe.$('#skin').attr('href');
	// 	var basePath = href.substr(0, href.indexOf('themes')) + 'themes/';
		
	// 	var frames = winiframe.frames;
	// 	if (cssPath == null || cssPath == ""){
	// 		cssPath = 'default';
	// 	}
	// 	winiframe.document.getElementById("skin").href = basePath + cssPath + "/default.css";
	// 	for (var i = 0; i < frames.length; i++) {
	// 		//证明是该页面是框架页面
	// 		if (frames[i].frames.length > 0) {
	// 			//判断页面中是否存在iframe
	// 			var iframes = frames[i].document.getElementsByTagName("iframe");
	// 			if(iframes.length > 0){//如果页面含有iframe,那么此页面也需要换肤
	// 				var linkObj = frames[i].document.getElementById("skin"); //获取link对象
	// 				if (linkObj != null) {
	// 					linkObj.href = basePath + cssPath + "/default.css";
	// 				}
	// 			}
	// 			_changeSkin(frames[i], cssPath);//递归换肤
	// 		} else {
	// 			var linkObj = frames[i].document.getElementById("skin"); //获取link对象
	// 			if (linkObj != null) {
	// 				linkObj.href = basePath + cssPath + "/default.css";
	// 			}
	// 		}
	// 	}
	// }

	// // 获取cookie更改皮肤
	// var _themesInit = function(){
	// 	//获取默认皮肤路径
	// 	var cssPath = _getCookie("cssPath");
	// 	_changeSkin(window.top, cssPath);
	// 	$('#shortcut').attr('href',cssPath);
	// }

	// _themesInit();

	// 对外调用方法
	return {

		// 保存Cookie
		setCookie : _setCookie,

		// 获取Cookie
		getCookie : _getCookie,

		// ifreme递归
		// changeSkin : _changeSkin
	}
})();

/**
* 日期：2016-12-15
* 作者：Zhudc
* 描述：tab切换
*/
var layerTabService = (function(){
	var _layerTab = function(){
		layui.use('element', function(){
			//Tab的切换功能，切换事件监听等，需要依赖element模块
			var element = layui.element();
			//一些事件监听
			element.on('tab(tabService)', function(data){
				fixtabGrid(data);
			});
		});

		//修复grid在tab加载问题
		var fixtabGrid = function(data){
			var tabItem = $('.layui-tab-item').eq(data.index),
				id = tabItem.find('iframe').attr('id'); //attr() 方法也用于设置/改变属性值
			if(id !== undefined ){
				tabItem.find('iframe').css('visibility','hidden'); //find() 方法获得当前元素集合中每个元素的后代，通过选择器、jQuery 对象或元素来筛选。
				document.getElementById(id).contentWindow.location.reload(true); //contentDocument 属性能够以 HTML 对象来返回 iframe 中的文档。可以通过所有标准的 DOM 方法来处理被返回的对象。  location.reload([bForceGet]) 参数： bForceGet， 可选参数， 默认为 false，从客户端缓存里取当前页。true, 则以 GET 方式，从服务端取最新的页面, 相当于客户端点击 F5("刷新") 
				document.getElementById(id).onload = function(){
					tabItem.find('iframe').css('visibility','visible');
				};
			}
		}

		// 高度计算
        var _setTabHei = function(){
			var obj = $('.layui-tab').find('.layui-tab-content');
			var hei = $(window).height() - obj.offset().top;
			if($('.page-foot').length > 0){
				hei = hei - $('.page-foot').outerHeight(true);
			}
			obj.height(hei);
			obj.find('.layui-tab-item').height(hei);
        }
		//初始化高度
        _setTabHei();
		windowResizeService.windowResize(_setTabHei);
	}

	// 对外调用方法
	return {
		layerTab : _layerTab
	}
})();

/**
* 日期：2016-12-15
* 作者：Zhudc
* 描述：windowResize
*/
var windowResizeService = (function(){
	/**
	 * 窗口改变执行
	 * @param objfun 执行方法
	 */
	var resize;
	var isIE8 = false;
	var _windowResize = function(objfun){

		isIE8 = !! navigator.userAgent.match(/MSIE 8.0/); //判断浏览器
		if (isIE8) {
			var currheight;
			$(window).resize(function() {
				if(currheight == document.documentElement.clientHeight) {
					return; //quite event since only body resized not window.
				}
				if (resize) {
					clearTimeout(resize);
				}
				resize = setTimeout(function() {
					objfun();
				}, 100); // wait 50ms until window resize finishes.
				currheight = document.documentElement.clientHeight; // store last body client height
			});
		} else {
			$(window).resize(function() {
				if (resize) {
					clearTimeout(resize);
				}
				resize = setTimeout(function() {
					objfun();
				}, 100);
			});
		}
	}

	// 对外调用方法
	return {
		windowResize : _windowResize
	}
})()






module.exports = {
	test:1111
}
