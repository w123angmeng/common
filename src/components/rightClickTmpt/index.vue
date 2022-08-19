<template>
    <div class="rightClickTmpt">
        <ul v-show="childData.state" :style="{left:childData.left+'px',top:childData.top+'px'}" class="contextmenu">
            <li v-for="item in childData.dataList" :key="item.id" @click="selectHandle(item)">{{item.name}}</li>
        </ul>
    </div>
</template>

<script>
export default {
    props:{
        clickData:{
            type:Object,
            default:()=>{
                return {
                    state:false,
                    top:0,
                    left:0,
                    dataList:[
                        {
                            name:'模板哦~',
                            id:1,
                        },
                        {
                            name:'模板哦!',
                            id:2,
                        },
                        {
                            name:'模板哦...',
                            id:3,
                        },
                    ]
                }
            }
        }
    },
    model:{
        prop:"clickData",
        event:"clickHand"
    },
    data () {
        return {
            childData:null,
        }
    },
    components: {},
    computed: {},
    created () {
        this.childData = this.clickData;

    },
    mounted () {},
    methods: {
        selectHandle(obj){
            this.childData.state = false;
            this.$emit('clickHand',obj);
        },
        closeMenu() {
            this.childData.state = false;
        }
    },
    watch: {
        childData(value) {
            if (value.state) {
                document.body.addEventListener('click', this.closeMenu)
            } else {
                document.body.removeEventListener('click', this.closeMenu)
            }
        }
    }
}
// 模板使用方法
// 引入组件并传入数据
// 组件模板 rightClickTmpt
// clickData 
//         state:Boolean   *弹窗显示/隐藏
//         top:Number      *距目标元素上部距离
//         left:Number     *距目标元素左侧距离
//         dataList:Array  *弹窗渲染模板数据
//             name:String *选项的名称
//             id:Number   *选项唯一键
//             ...         按需定义
// 事件回调 clickHand(event) 
//应用：
// 目标元素<label @contextmenu.prevent.native="xxx($event)"></label>
//  
// <div v-if="xxx">
//     <rightClickTmpt :clickData="xxx" @clickHand="xxx"></rightClickTmpt>
// </div>
// css样式自行添加 目前只是测试的样式具体以设计图为主
</script>
<style lang='scss' src='./index.scss'></style>
