(function($, w) {
	"use strict";
	var defaults = {
			split: '/',
			url: '',
			disabled: false,
			data: [],
			async: false,
			onLoad: function() {

			},
			onSelect: function() {},
			onClose: function() {

			}
		},
		areaSelect = function(selector, context) {
			this.init.call(this, selector, context); //替换this对象
			return this;
		},
		_sClass = 'area-select',
		d = document,
		jq = $.fn;
	jq.extend({
		A: jq.addClass,
		C: jq.children,
		R: jq.removeClass,
		P: jq.append
	});
	areaSelect.prototype = {
		constructor: areaSelect,
		init: function(selector, context) {
			var that = this,
				options = that.options = $.extend({}, defaults, context);
			that.selector = selector;
			that.disabled = options.disabled;
			if (!!options.disabled) that.selector.addClass('disabled');
			that.selectedCodes = [];
			//优先使用设置的data属性
			if (options.data.length) {
				_init.call(that, selector, options.data);
				_bindEvents.call(that, selector);
				options.onLoad();
			} else {
				if ($.trim(options.url) !== '') {
					$.when(_request.call(that, selector)).done(function() {
						_bindEvents.call(that, selector);
						options.onLoad();
					});
				} else console.log('Data error: there is no data here.');
			}
			return that;
		},
		getSelectedCodes: function() {
			return this.selectedCodes;
		},
		setDisabled: function(disabled) {
			if (disabled == void 0) this.disabled = !this.disabled, this.selector.toggleClass('disabled');
			else this.disabled = disabled, !disabled ? this.selector.removeClass('disabled') : this.selector.addClass('disabled');
		},
		setSelected: function(index, tabIndex) {
			var _i = index == void 0 ? 0 : index,
				_ti = tabIndex == void 0 ? 0 : tabIndex;
			this.$content.find("ul").eq(_ti).children().eq(_i).mousedown();
			this.close();
		},
		close: function() {
			this.$head.mousedown();
			this.options.onClose(this.selectedCodes);
		}
	};
	$.fn.areaSelect = function() {
		var _self = this,
			args = Array.prototype.slice.call(arguments);
		_self.A(_sClass);
		_self.empty();
		_self.parent().css('position', 'relative');
		return new areaSelect(_self, args[0]);
	};

	function _init(selector, source) {
		var $v = $.create('div', 'select-data'),
			data = source,
			options = this.options;
		selector.P($v);
		if (data.length) {
			var $w = $.create('div', 'select-wrap clear'),
				$u = [];
			if (!!data[0].data) {
				$u = $.create('ul', 'select-tabs');
				$w.P($u);
			} else $w.A('single');
			selector.P($w);

			//初始化结果区域（默认第一条数据）
			var def = data[0];
			_initDefault($v, $u, def);
			this.$tab = $u;
			this.$head = $v;
			//默认首个选项激活状态
			if ($u.length)
				$u.C().eq(0).A('active');

			//初始化展开的选择区域
			var $c = $.create('div', 'select-content clear');
			$w.P($c);
			this.$content = $c;
			_initContent($c, source);
			//默认显示首个选择区域
			$c.C().eq(0).show();
		}
		$v.P('<i class="triangle"></i>');

		function _initDefault(child1, child2, def) {
			var $s = $('<span>'),
				$li = $('<li>'),
				_h = ['<a href="javascript:"><span>', def.name, '</span><i class="triangle"> </i>', '</a>'];
			$s.html(def.name);
			$s.attr('title', def.name);
			$s.data('code', def.code);
			child1.P($s);
			if (child2.length) {
				$li.data('code', def.code);
				$li.data('index', child2.C().length);
				$li.attr('data-index', child2.C().length);
				child2.P($li.P(_h.join('')));
			}
			if (!!def.data && def.data.length) {
				child1.P(options.split);
				_initDefault(child1, child2, def.data[0]);
			}
		}

		function _initContent(selector, source) {
			var $ul = $.create('ul');
			$ul.data('index', selector.C().length);
			$ul.attr('data-index', selector.C().length);
			selector.P($ul);
			$.each(source, function(i, item) {
				var $li = $.create('li'),
					_h = ['<a href="javascript:">', item.name, '</a>'];
				$li.P(_h.join(''));
				if (i === 0) $li.A('selected');
				$li.data('code', item.code);
				$li.data('index', i);
				$li.data('data', item.data);
				$ul.P($li);

			});
			if (!!source[0].data && source[0].data.length) {
				_initContent(selector, source[0].data);
			}
		}
	}

	function _request(selector) {
		var dtd = $.Deferred(),
			_self = this,
			options = _self.options;
		$.get(options.url).done(function(data) {
			if (typeof data == "string") data = eval("(" + data + ")");
			if (data.flag != void 0 && (data.flag == "true" || data.flag === true)) {
				options.data = data.data;
				_init.call(_self, selector, options.data);
			} else
				console.log('Request error:please check the network and make sure the url is correct.');
			dtd.resolve();
		});
		return dtd.promise();
	}

	function _bindEvents(selector) {
		//点击弹出(隐藏)选择部分
		var _self = this,
			_click = 'mousedown',
			_expand = 'expand',
			$head = selector.C();
		_eventHandler($head.eq(0), _click, _ctrlClick);
		//点击切换区域选项
		var $ctrl = $head.eq(1).C(),
			$tabs = $ctrl.eq(0).find('li');
		if ($ctrl.length == 1) {
			_tabsClick = _liClick;
		}
		_eventHandler($tabs, _click, _tabsClick);
		//点击选择具体的区域
		var $lis = $ctrl.eq(1).find('li');
		_eventHandler($lis, _click, _liClick)

		_eventHandler($head.eq(1), _click, function(e) {
			e.stopPropagation();
		});

		_eventHandler($(d), _click, _bodyClick);

		function _ctrlClick() {
			if (!!_self.disabled) return;
			var $e = $('.' + _expand + '.' + _sClass),
				$p = $(this).parent();
			if ($p.hasClass(_expand)) $p.R(_expand);
			else {
				if ($e.length)
					$e.R(_expand);
				$p.A(_expand);
			}
		}

		function _tabsClick() {
			$ctrl.find('li.active').R('active');
			var _index = $(this).data('index'),
				$all = $(this).parent().next().find('ul');
			$(this).toggleClass('active');
			$all.hide();
			$all.eq(_index).show();
		}

		function _liClick() {
			var $parent = $(this).parent(),
				_index = $parent.data('index'),
				_currentCode = $(this).data('code');
			$parent.C().R('selected');
			$(this).A('selected');

			_setSelectCodes(_index, {
				id: _currentCode,
				name: $(this).text()
			});

			//回调自定义点击事件
			var _return = _self.options.onSelect($(this).data('index'), {
				id: _currentCode,
				name: $(this).text()
			}, $(this));

			if (_self.options.async && typeof _return === 'object') {
				var that = this;
				_return.done(function() {
					done.call(that);
				});
			} else done.call(this);

			function done() {
				//选项不存在
				if ($ctrl.length == 1) {
					$head.eq(0).find('span').text($(this).text());
				} else {
					//设置选项
					var $tab = $parent.parent().prev().C().eq(_index);
					$tab.find('span').text($(this).text());

					if ($tab.next().length) {
						var _h = true,
							_d = $(this).data('data'),
							$nTab = $tab.next();
						_render($parent.next(), _d);
						if (!_return || typeof _return == "object")
							$nTab.mousedown()
						else
							_h = false;
					}
					if (!_h) {
						//设置主文本框
						var vArr = [];
						$.each($ctrl.eq(0).children(), function(i, elm) {
							vArr.push($.trim($(elm).text()));
						});
						$.each($head.eq(0).find('span'), function(i, elm) {
							$(elm).text(vArr[i]);
						});
					}
				}

				if (!$parent.next().length || !!_return && typeof _return == "boolean") {
					//末个选项点击后触发关闭
					$head.mousedown();
					//回调自定义关闭事件
					_self.options.onClose(_self.selectedCodes);
				}
			}
		}

		function _bodyClick(evt) {
			var _target = evt.srcElement || evt.target;
			if (selector.hasClass(_expand) && !$(_target).closest('.' + $head[0].className).length) selector.R(_expand);
		}

		function _render(selector, source) {
			var $lis = selector.children();
			$lis.removeClass('selected');
			$.each(source, function(i, _) {
				var $li = $lis.eq(i);
				if ($li.length) {
					$li.children().text(_.name);
				} else {
					$li = $('<li></li>');
					var $a = $('<a href="javascript:""></a>');
					$li.data('index', $lis.length);
					$a.text(_.name);
					$li.append($a);
					selector.append($li);
					_eventHandler($li, _click, _liClick);
				}
				if (i == 0) $li.addClass('selected');
				$li.data('code', _.code);
				$li.data('data', _.data);
			});
			if (source.length < $lis.length) {
				for (var i = $lis.length - 1; i >= source.length; i--) {
					$lis[i].remove();
				}
			}
			if (!!source && source.length) {
				var _i = selector.data('index'),
					$tab = selector.parent().prev().C().eq(_i);
				_setSelectCodes(_i, {
					id: source[0].code,
					name: source[0].name
				});
				$tab.find('span').text(source[0].name);

				if (selector.next().length && !!source[0].data) {
					var _d = source[0].data;
					_render(selector.next(), _d);
				}
			}
		}


		function _setSelectCodes(_index, _currentCode) {
			var _len = _self.selectedCodes.length;
			//保存当前选择区域编码
			if (_len > _index)
				_self.selectedCodes[_index] = _currentCode;
			else {
				if (_len < _index)
					for (var i = _index; i > _len; i--) {
						_self.selectedCodes.push(null);
					}
				_self.selectedCodes.push(_currentCode);
			}
		}
	}

	function _eventHandler(selector, type, fn) {
		selector.on(type, fn);
	}

	$.create = function(elm, className) {
		return $(d.createElement(elm)).A(className);
	};
})(jQuery, window);