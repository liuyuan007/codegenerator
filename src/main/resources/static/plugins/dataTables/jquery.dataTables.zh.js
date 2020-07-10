(function() {
	var oLanguage = {
		"oAria" : {
			"sSortAscending" : ": 升序排列",
			"sSortDescending" : ": 降序排列"
		},
		"oPaginate" : {
			"sFirst" : "首页",
			"sLast" : "末页",
			"sNext" : "下页",
			"sPrevious" : "上页"
		},
		"sEmptyTable" : "没有相关记录",
		"sInfo" : "正显示第 _START_ 到 _END_ 条记录, 共 _TOTAL_ 条",
		"sInfoEmpty" : "显示第 0 到 0 条记录，共 0 条",
		"sInfoFiltered" : "(从 _MAX_ 条记录中检索)",
		"sInfoPostFix" : "",
		"sDecimal" : "",
		"sThousands" : ",",
		"sLengthMenu" : "每页显示 _MENU_ 条记录",
		"sLoadingRecords" : "正在载入...",
		"sProcessing" : "正在载入...",
		"sSearch" : "搜索:",
		"sSearchPlaceholder" : "",
		"sUrl" : "",
		"sZeroRecords" : "没有相关记录"
	}
	$.fn.dataTable.defaults.oLanguage = oLanguage;
})();
// 通用表格操作封装
var Table = {
	// 默认配置
	_setting : {
		// 导出仅仅能到处一夜，分页操作时无法使用
		dom : 'ft<"bottom"i><"clear">',
		ordering : false,// 排序
		paging : true,// 分页按钮
		info : true,// 页面信息
		pagingType : "full_numbers",// 分页导航样式
		processing : true,
		serverSide : false,
		stateSave : true,
		autoWidth : false,
	},
	_cache : {},
	_current : null,// 警告:同时初始化多个表格时有错误()
	/**
	 * 构建一个数据表格
	 * 
	 * @param config
	 *            表格通用操作定义
	 * @param setting
	 *            表格初始化参数
	 */
	builderTable : function(config, setting) {
		var tableId = config.tableId;
		Table._cache[tableId] = config;
		Table._current = config;
		var _setting = {};
		$.extend(_setting, Table._setting);
		if (setting) {
			$.extend(_setting, setting);
		}
		if (config.hasServer) {
			_setting.serverSide = true;
			if (!setting.dom) {
				_setting.dom = 'ft<"bottom"ipl><"clear">';
			}
			_setting.serverData = Table.ajaxDataSource;
			//console.log("_setting.serverData::::"+Table.ajaxDataSource);
		}
		var oTable = $('#' + config.tableId).DataTable(_setting);// 初始化表格
		config.table = oTable;// 绑定表对象

		var wrapper = $('#' + tableId + '_wrapper')
		// 自定义搜索区域
		var filter = wrapper.find('div.dataTables_filter');
		filter.css("overflow", "hidden");
		filter.empty();// 清除原有逻辑
		// 初始化表头按钮
		var _btns = '<div class="toolbar pull-left">';
		if (config.buttons && config.buttons.length > 0) {
			for ( var i in config.buttons) {
				switch (config.buttons[i]) {
				case 'add':
					var _add = '';
					if (config.addUrl != undefined) {
						_add = 'pathRedirect.location(\'' + config.controller + '/'+config.addUrl+'\')';
					} else if (config.addCallBack) {
						_add = config.addCallBack + '(\'' + config.controller + '/add\')';
					} else {
						_add = 'pathRedirect.location(\'' + config.controller + '/add\')';
					}
					_btns += '<button purview="' + config.controller + '/add" class="btn btn-sm btn-primary" type="button" onclick="' + _add + '"><i class="fa fa-file"></i> 新增</button> ';
					break;
				case 'del':
					_btns += '<button purview="' + config.controller + '/delete" class="btn btn-sm btn-danger" type="button" onclick="Table.dels(\'' + tableId + '\')"><i class="fa fa-trash"></i><span class="bold"> 删除</span></button> ';
					break;
				}
			}
		}
		if (config.buttonsCallBack) {
			_btns += config.buttonsCallBack();
		}
		_btns += '</div>';
		filter.prepend(_btns);
		var loaded = oTable.state.loaded();
		var search = '';
		if (loaded) {
			search = loaded.search.search;
		}
		filter.append('<div class="input-group-sm pull-right"><input type="search" id="filterInput" class="form-control pull-left" placeholder="" aria-controls="' + tableId + '" value="' + search + '"> <span class="input-group-btn pull-left"> <a href="javascript:void(0);" title="检索" id="filterButton" class="btn btn btn-primary"><i class="fa fa-search fa_search"></i></a> </span></div>');
		if (config.hasServer) {// 与服务器有关，手动搜索
			filter.find('#filterButton').on("click", function() {
				var val = filter.find('#filterInput').val();
				if (oTable.search() !== val) {
					oTable.search(val).draw();
				}
			});
		} else if(config.btFindFlag && !config.hasServer) {    //动态列表，自定义搜索 
			//若定义btFindFlag为true，表示自定义事件控制查询 
			oTable.page.len(-1).draw();//直接显示所有行
			filter.find('#filterInput').on('blur', function() {
					//回调自定义事件
				config.btFindCallBack(this.value);
			});
		}else {// 静态列表，自动搜索
			oTable.page.len(-1).draw();//直接显示所有行
			filter.find('#filterInput').on('keyup change', function() {
				if (oTable.search() !== this.value) {
					oTable.search(this.value).draw();
				}
			});
		}
		$('#' + tableId + '_length select').removeClass();
		//adjustFrame();
		// checkPurview();                 //权限验证，可隐藏按钮
		return oTable;
	},

	ajaxDataSource : function(url, args, callBack, setting) {
		var config = Table._cache[setting.sTableId];
		var _controller = config.controller;
		// 分页参数
		var param = {
			pageSize : args[4].value == 0 ? 10 : args[4].value,
			pageNum : args[3].value > 0 ? (args[3].value / args[4].value) + 1 : 1,
		};
		// 删除参数
		if (args[5].value) {
			param.search = args[5].value.value;
		}
		// 扩展参数
		for (var i = 6; i < args.length; i++) {
			param[args[i].name] = args[i].value;
		}
		if (config.paramCallBack) {
			$.extend(param, config.paramCallBack());
		}
		var url = config.url;
		if ( url == undefined || url.length <= 0 ){
			url = _controller + "/list";
		}
		if (config.listUrl != undefined) {
			url = _controller +"/"+config.listUrl;
		}
		Ajax.post(url, param, function(data, isSuccess) {
			if (isSuccess) {
				var total, list;
				if (data.pages > 0) {
					total = data.total;
					list = data.list;
				} else {
					data.list = [];
					total = data.list.length;
					list = data.list;
				}
				callBack({
					"sEcho" : null,
					"iTotalRecords" : total,
					"iTotalDisplayRecords" : total,
					"aaData" : list
				});
				// checkPurview();                 //权限验证，可隐藏按钮
			}
		});
	},
	/**
	 * 为table创建按钮
	 * 
	 * @param row
	 *            数据行
	 * @param btns
	 *            需要的按钮
	 * @returns {String}
	 */
	getButtons : function(row, btns) {
		if (!btns) {
			btns = [];
		}
		var params = Table.getParamsStr(row, arguments);
		if (!params) {
			return '';
		}
		var html = '';
		var config;
		if (row.TABLE_ID) {
			config = Table._cache[row.TABLE_ID];
		} else {
			config = Table._current;
		}
		if (config.rbtnCallBack) {
			var _bt = config.rbtnCallBack(config.tableId, params, row);
			if (_bt) {
				html += _bt;
			}
		}
		for ( var i in btns) {
			switch (btns[i]) {
				case 'edit':
					html += ' <a href="javascript:void(0);" purview="' + config.controller + '/edit" title="编辑" class="btn btn-xs btn-outline btn-primary  " onclick=\'Table.edit(this,"' + config.tableId + '",' + params + ')\'> <i class="fa fa-pencil"></i></a>';
					break;
				case 'del':
					html += ' <a href="javascript:void(0);" purview="' + config.controller + '/delete" title="删除" class="btn btn-xs btn-outline btn-danger" onclick=\'Table.del(this,"' + config.tableId + '",' + params + ')\'> <i class="fa fa-times"></i></a>';
					break;
				case 'enable':
					html += ' <a href="javascript:void(0);" purview="' + config.controller + '/enable" title="启用" class="btn btn-xs  btn-outline btn-success" onclick=\'Table.enable(this,"' + config.tableId + '",' + params + ')\'> <i class="fa fa-check-circle-o"></i></a>';
					break;
				case 'disable':
					html += ' <a href="javascript:void(0);" purview="' + config.controller + '/disable" title="禁用" class="btn btn-xs  btn-outline btn-danger" onclick=\'Table.disable(this,"' + config.tableId + '",' + params + ')\'> <i class="fa fa-ban"></i></a>';
					break;	
				case 'publish':
					html += ' <a href="javascript:void(0);" purview="' + config.controller + '/publish" title="发布" class="btn btn-xs btn-outline btn-primary  " onclick=\'Table.publish(this,"' + config.tableId + '",' + params + ')\'> <i class="fa  fa-send"></i></a>';
					break;
			}
		}
		return html;
	},
	// 获取行操作传递参数
	getParamsStr : function(row, args) {
		if (args.length < 3) {
			return false;
		}
		var params = {};
		for (var i = 2; i < args.length; i++) {
			params[args[i]] = row[args[i]];
			if (params[args[i]] && Utils.isString(params[args[i]]) && params[args[i]].indexOf('"') != -1) {
				params[args[i]] = params[args[i]].replace(/"/g, '')
			}
		}
		return '\"' + JSON.stringify(params).replace(/"/g, '\\"') + '\"';
	},
	// 全选
	checkAll : function(obj) {
		$(obj).parents('thead').siblings('tbody').find('input[name="' + obj.name + '"]').each(function(i) {
			this.checked = obj.checked;
		});
	},
	// 编辑
	edit : function(obj, tableId, params) {
		var config = Table._cache[tableId];
		params = JSON.parse(params);
		delete params[config.delTipsKey];
		if (config.editCallBack) {
			config.editCallBack(config.controller + '/edit', params);
			return;
		}
		var _params = '';
		var i = 0;
		for ( var key in params) {
			if (i > 0) {
				_params += '&';
			}
			_params += key + '=' + params[key];
			i++;
		}
		pathRedirect.location(config.controller + '/edit?' + _params);
	},
	// 删除
	del : function(obj, tableId, params) {
		params = JSON.parse(params);
		var config = Table._cache[tableId];
		var tips = $(obj).attr('tips');
		if (tips == undefined) {
			tips = '删除';
		}
		Alert.confirm(tips + config.tips, "您确定需要" + tips + "【" + params[config.delTipsKey] + "】?", function(isConfirm) {
			if(!isConfirm){
				return;
			}
			delete params[config.delTipsKey];
			var url = "";
			if (config.delUrl != undefined) {
				url = config.delUrl;
			}else {
				url = config.controller + "/delete";
			}
			Ajax.loadingPost(url , params, function(data, isSuccess) {
				if (config.delCallBack) {
					config.delCallBack(data, isSuccess);
					return;
				}
				if (isSuccess) {
					Alert.success("成功",config.tips + "删除成功!");
					if (config.isStatic) {
						Table.removeRow([ obj ], config.table);
					} else {
						var page = config.table.page.info();
						if (page.pages > 0 && page.start >= page.end - 1) {// 本页无数据，跳转到上一页
							config.table.page('previous').draw('page');
						} else {
							config.table.page(page.page).draw('page');
						}
					}
				}
			});
		});
	},
	//启用
	enable : function(obj, tableId, params) {
		params = JSON.parse(params);
		var config = Table._cache[tableId];
		var tips = $(obj).attr('tips');
		if (tips == undefined) {
			tips = '启用';
		}
		Alert.confirm(tips + config.tips, "您确定" + tips + "【" + params[config.delTipsKey] + "】?", function(isConfirm) {
			if(!isConfirm){
				return;
			}
			delete params[config.delTipsKey];
			var url = "";
			if (config.enableUrl != undefined) {
				url = config.delUrl;
			}else {
				url = config.controller + "/enable";
			}
			Ajax.loadingPost(url , params, function(data, isSuccess) {
				if (config.delCallBack) {
					config.delCallBack(data, isSuccess);
					return;
				}
				if (isSuccess) {
					Alert.success(config.tips + tips + "成功!");
					if (config.isStatic) {
						Table.removeRow([ obj ], config.table);
					} else {
						var page = config.table.page.info();
						if (page.pages > 0 && page.start >= page.end - 1) {// 本页无数据，跳转到上一页
							config.table.page('previous').draw('page');
						} else {
							config.table.page(page.page).draw('page');
						}
					}
				}
			});
		});
	},
	//禁用
	disable : function(obj, tableId, params) {
		params = JSON.parse(params);
		var config = Table._cache[tableId];
		var tips = $(obj).attr('tips');
		if (tips == undefined) {
			tips = '禁用';
		}
		Alert.confirm(tips + config.tips, "您确定" + tips + "【" + params[config.delTipsKey] + "】?", function(isConfirm) {
			if(!isConfirm){
				return;
			}
			delete params[config.delTipsKey];
			var url = "";
			if (config.enableUrl != undefined) {
				url = config.delUrl;
			}else {
				url = config.controller + "/disable";
			}
			Ajax.loadingPost(url, params, function(data, isSuccess) {
				if (config.delCallBack) {
					config.delCallBack(data, isSuccess);
					return;
				}
				if (isSuccess) {
					Alert.success(config.tips + tips + "成功!");
					if (config.isStatic) {
						Table.removeRow([ obj ], config.table);
					} else {
						var page = config.table.page.info();
						if (page.pages > 0 && page.start >= page.end - 1) {// 本页无数据，跳转到上一页
							config.table.page('previous').draw('page');
						} else {
							config.table.page(page.page).draw('page');
						}
					}
				}
			});
		});
	},
	//发布
	publish:function(obj, tableId, params) {
		params = JSON.parse(params);
		var config = Table._cache[tableId];
		var tips = $(obj).attr('tips');
		if (tips == undefined) {
			tips = '发布';
		}
		Alert.confirm(tips + config.tips, "您确定" + tips + "【" + params[config.delTipsKey] + "】?", function(isConfirm) {
			if(!isConfirm){
				return;
			}
			delete params[config.delTipsKey];
			Ajax.loadingPost(config.controller + "/publish", params, function(data, isSuccess) {
				if (config.delCallBack) {
					config.delCallBack(data, isSuccess);
					return;
				}
				if (isSuccess) {
					Alert.success(config.tips + tips + "成功!");
					if (config.isStatic) {
						Table.removeRow([ obj ], config.table);
					} else {
						var page = config.table.page.info();
						if (page.pages > 0 && page.start >= page.end - 1) {// 本页无数据，跳转到上一页
							config.table.page('previous').draw('page');
						} else {
							config.table.page(page.page).draw('page');
						}
					}
				}
			});
		});
	},
	// 批量删除
	dels : function(tableId,callback) {
		var checks = $('#' + tableId + ' input[id!="checkAll"]:checkbox:checked');
		if (checks.length < 1) {
			Alert.tips("未选择任何数据");
			return false;
		}
		var config = Table._cache[tableId];
		Alert.confirm('删除' + config.tips, "您确定需要删除选中" + config.tips + "?", function(isConfirm) {
			if(!isConfirm){
				return;
			}
			var url = "";
			if (config.enableUrl != undefined) {
				url = config.delUrl;
			}else {
				url = config.controller + "/delete";
			}
			Ajax.loadingPost(url, checks.serializeArray(), function(data, isSuccess) {
				if (isSuccess) {
					//回调函数处理
					if (callback != undefined){
						callback(data);
					}
					Alert.success("成功",config.tips + "删除成功!");
					if (config.isStatic) {
						Table.removeRow(checks, config.table);
					} else {
						var page = config.table.page.info();
						if (page.pages > 0 && page.end > page.start >= page.end - data.count) {
							config.table.page('previous').draw('page');// 本页无数据，跳转到上一页
						} else {
							config.table.page(page.page).draw('page');
						}
					}
				}
			});
		});
	},
	/**
	 * 删除表中 checkbox选择的列
	 * 
	 * @param tableId
	 */
	removeRow : function(checks, table) {
		if (checks.length < 1) {
			return;
		}
		for (var i = 0; i < checks.length; i++) {
			var row = table.row($(checks[i]).parents('tr'));
			row.remove();
		}
		table.draw();
	}
}