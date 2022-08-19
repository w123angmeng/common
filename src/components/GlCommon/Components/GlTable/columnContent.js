/*
* 渲染table操作列查看和更多
* h      render函数
* params 当前行的数据
* {
*   toView        查看回调
*   handleCommand 点击抽屉回调
*   btns          配置抽屉列表
* }
* */
export const renderTableOperationColumnSelDropdown = (h, params, {editFn , handleCommand, btns}) => {
    return h('div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }
        , [h(
            'el-button',
            { attrs: { type: 'text', size: 'mini' }, on: { click: () => { editFn(params.row) } } },
            '编辑'),
            h('div', { style: {margin: '0px 5px', color: '#EAEAEA'} },
                '|'),
            h('el-dropdown',
                {on : {command: (val) => { handleCommand(val, params.row)}}},
                [
                    h('span',
                        {class: 'el-dropdown-link'},
                        [
                            h('span', {style: {fontWeight: 500, cursor: 'pointer', color: '#1890FF', fontSize: '12px'}}, '更多'),
                            h('i', {style: {color: '#1890FF', fontWeight: 500}, class: 'el-icon-arrow-down el-icon--right'})
                        ]
                    ),
                    h('el-dropdown-menu',
                        {slot: 'dropdown'},
                        // btns.map((v) => {
                        //     return h('el-dropdown-item', {attrs: {command: v.value}}, v.label)
                        // })
                        [
                            h('el-dropdown-item', {attrs: {command: 'copy'}}, '复制'),
                            // h('el-dropdown-item', {attrs: {command: 'edit'}}, '编辑'),
                            h('el-dropdown-item', {attrs: {command: 'disable'}}, params.row.enabled == 0 ? '启用' : '禁用'),
                            h('el-dropdown-item', {attrs: {command: 'del'}}, '删除')
                        ]
                    )
                ]
            )
        ])
}
