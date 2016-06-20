var outletAreaData = {
    'flag':'true',
    'data':[{
        'code':'001',
        'name':'全部大区',
        'data':[{
            'code':'0001',
            'name':'全部分公司',
            'data':[{
                'code':'00001-1',
                'name':'全部门店'
            }]
        },{
            'code':'0002',
            'name':'南京分公司',
            'data':[{
                'code':'00002-1',
                'name':'全部门店'
            }]
        }
    ]
    },
    {
        'code':'002',
        'name':'南京大区',
        'data':[{
            'code':'0001',
            'name':'全部分公司',
            'data':[{
                'code':'00001-1',
                'name':'全部门店'
            }]
        },{
            'code':'0002',
            'name':'南京分公司',
            'data':[{
                'code':'00002-1',
                'name':'全部门店'
            }]
        }
    ]
    }
]
};
var select1 = $("#select1").areaSelect({
    data: outletAreaData.data,
    onLoad: function(){
        alert('Load success.');
    },
    onSelect: function(code){
        console.log('You have got one,code:',code);
    },
    onClose: function(codes){
        console.log('It‘s closed.Current selectedCodes:',codes);
    }
});

var select2 = $("#select2").areaSelect({
    // data: outletAreaData.data
    url:'http://10.24.47.196:2001/yingyan/build/temp/data.txt'
});
