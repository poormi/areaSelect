var ECode = ECode || {},
	w = window;
ECode.Wdate = function(options) {
	var o = {},
		_t = new Date(),
		defaults = {
			maxDate: _t.getFullYear() + '-' + (_t.getMonth() + 1),
			minDate: '2014-01',
			dateFmt: 'yyyy年MM月',
			onpicked: $.noop,
			onpicking: $.noop
		},
		F = w.event,
		options = $.extend(o,
			defaults, options),
		$elm, $p, $wrap,
		_y = _y0 = _cy = _t.getFullYear(),
		_m = _cm = _m0 = _t.getMonth() + 1;
	F = D();
	$elm = $(F.srcElement || F.target);
	$p = $elm.parents('.w-input');
	render();

	function D() {
		var func = D.caller;
		while (func != null) {
			var $ = func.arguments[0];
			if ($ && ($ + "").indexOf("Event") >= 0)
				return $;
			func = func.caller
		}
		return null;
	}

	function render() {
		$p.addClass('open');
		if ($p.next('.w-wrap').length) {
			$wrap = $p.next('.w-wrap');
			_gM();
			_rY();
			_cY();
			$wrap.show();
		} else {
			var _pos = $p.offset(),
				_Ppos = $p.parent().offset();
			$wrap = $("<div></div>");
			$wrap.addClass('w-wrap');
			$wrap.css("left", _pos.left - _Ppos.left - $p.width());
			$wrap.insertAfter($p);
			$wrap.parent().css('position', 'relative');
			$wrap.on('mousedown', function(e) {
				e.stopPropagation();
			})
			_gM();
			_rY();
			_rM();
			$(document).on('mousedown', _bC);
		}

		//父容器点击事件
		function _bC(evt) {
			var _target = evt.srcElement || evt.target,
				$pp = $(_target).parents('.w-input');
			if ($p.hasClass('open') && $pp[0] != $wrap[0] && _target != $elm[0]) $p.removeClass('open'), $wrap.hide();

		}

		//获取最(大、小)值
		function _gM() {
			if (!!options.maxDate) {
				var _r = _cDo(options.maxDate);
				_y = _r.y, _m = _r.M;
			}
			if (!!options.minDate) {
				var _r = _cDo(options.minDate);
				_y0 = _r.y, _m0 = _r.M;
			}

			if ($.trim($elm.val()) !== '') {
				var _r = _cDo($elm);
				_cy = _r.y, _cm = _r.M;
				if (_cy > _y || _cy < _y0 || (_cy == _y && _cm > _m) || (_cy == _y0 && _cm < _m0)) $elm.val(''); //非法内容
			}
		}

		//渲染年份
		function _rY() {
			var $s = $wrap.find('select');
			if ($s.length) {
				$s.empty();
			} else {
				var $t = $("<div>年</div>"),
					$s = $('<select></select>');
				$t.addClass('w-year');
				$wrap.append($t.prepend($s));
				$s.change(function() {
					_cY(_gM());
				});
			}
			for (var i = _y; i >= _y0; i--) {
				var $o = $("<option></option>");
				$o.text(i);
				$o.val(i);
				$s.append($o);
			}
			$s.val(_cy);
		}

		//渲染月份
		function _rM() {
			var $u = $("<ul></ul>");
			$wrap.append($u);
			for (var i = 1; i <= 12; i++) {
				$li = $("<li></li>");
				$li.text(i + '月');
				if (i == _cm) $li.addClass('active');
				if (_cy == _y0 && i < _m0 || _cy == _y && i > _m) $li.addClass('disabled');
				$u.append($li);
			}
			$u.children().on('mousedown', _cM);
		}

		//选择年份
		function _cY() {
			var _sy = parseInt($wrap.find('select').children('option:selected').val()),
				$lis = $wrap.find('li'),
				_a = 'active',
				_d = 'disabled',
				_h = true;
			$lis.removeClass(_a + ' ' + _d);
			if (_cy == _sy) $lis.eq(_cm - 1).addClass(_a), _h = false; //当前选中月份激活
			$.each($lis, function(i, li) {
				if (_sy == _y0 && i < _m0 - 1 || _sy == _y && i >= _m) $(li).addClass(_d); //最小年份前面月份+最大年份后面月份禁用
				if (_h && _sy == _y0 && i == _m0 - 1 || _h && _sy == _y && i == _m - 1) //最小年份最小月份+最大年份最大月份激活
					$(li).addClass(_a), _h = false;
				else if (_h && i == 0 && !$(li).hasClass(_d))
					$(li).addClass(_a), _h = false;
			});

		}

		//选择月份
		function _cM() {
			if (!$(this).hasClass('disabled')) {
				$(this).parent().find('.active').removeClass('active');
				$(this).addClass('active');
				var _y = $wrap.find('select').val(),
					_ds = _cDs([_y, parseInt($(this).text())], 'yyyy-MM');
				$elm.val(_cDs([_y, parseInt($(this).text())], options.dateFmt));
				if (!!options.onpicking(_ds)) return;
				close(_ds);
			}
		}

		//时间格式化成对象
		function _cDo(source) {
			var r = {
					y: 0,
					M: 0
				},
				_a = [],
				i = 0;
			if (typeof source === 'object' && source.length) _a = source.val().match(/\d+/g)
			else _a = source.split('-')
			$.each(r, function(_, v) {
				r[_] = parseInt(_a[i]);
				i++;
			})
			return r;
		}

		//时间格式化成字符串
		function _cDs(source, format) {
			var _date = format;
			_v = format.match(/\w+/g);
			$.each(_v, function(i, _) {
				var _s = source[i];
				if (_.length == 2) {
					if (('' + _s).length == 4) _s = _s.substring(2)
					if (('' + _s).length == 1) _s = '0' + _s;
				}
				_date = _date.replace(_, _s);
			})
			return _date;
		}
	}

	//关闭选择层
	function close(dateStr) {
		$wrap.hide();
		$p.removeClass('open');
		options.onpicked(dateStr);
	}
}