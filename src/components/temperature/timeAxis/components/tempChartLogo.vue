<template>
    <div class="tempChartBox">
        <svg v-for="(item, idx) in tempChartData" :key="idx" style="width:36px;height:64px">
            <!-- 处理温度/脉搏/心率展示 线颜色填充 -->
            <template v-if='item.label == ""'> 
                <text>{{item.title}}</text>
                <path :key='item.key' :stroke='item.stroke' :stroke-width='item.strokeWidth' :fill='item.fill' :d='item.d'/>
            </template>
            <!-- 点标记 以及鼠标触摸提示 点颜色填充-->
            <template v-if='item.label == "circle"'>
                <text :x="item.cx" :y="item.cy - 36" fill="black" style="writing-mode:tb-rl">{{item.title}}</text>
                <g :class="item.pclassName" :key='item.pkey' v-tooltip='{content:item.ptitle,classes:"tooltipClass"}'>
                <circle :cx='item.cx' :cy='item.cy' :r='item.r' :stroke-width='item.strokeWidth' :stroke='item.stroke' 
                    :fill='item.fill' :title='item.title'/>
                </g> 
            </template> 
            <!-- 三角形-->
            <template v-if='item.label == "triangle"'>
                <text :x="item.x" :y="item.y - 36" fill="black" style="writing-mode:tb-rl">{{item.title}}</text>
                <g :class="item.pclassName" :key='item.pkey' v-tooltip='{content:item.title,classes:"tooltipClass"}'>
                    <path :title='item.title' :fill="item.fill" :stroke-width="item.strokeWidth" :stroke="item.stroke" :d='item.d'/>
                </g> 
            </template> 
            <template v-if="item.cross">
                <template v-if="item.cross.length">
                    <g v-for="cItem in item.cross" :key="cItem.id">
                        <!-- 处理 xx 标记 -->
                        <text :x="20" :y="cItem.y1 - 36" fill="black" style="writing-mode:tb-rl">{{cItem.title}}</text>
                        <template v-if='cItem.label == "line" && cItem.ppLabel == "svg"  && cItem.plabel == "Tooltip"'>
                            <line :type='cItem.type' :title='cItem.title' :x1="cItem.x1" :y1="cItem.y1" :x2="cItem.x2" :y2="cItem.y2"
                            :style='cItem.style' v-tooltip='{content:cItem.pTitle,classes:"tooltipClass"}'/>
                        </template>
                    </g>
                </template>
            </template>
            <!-- 呼吸机 起搏器-->
            <template v-if='item.label == "R" || item.label == "H"'>
                <text :x="20" :y="item.y - 36" fill="black" style="writing-mode:tb-rl">{{item.title}}</text>
                <text :x="18" :y="item.y+12" :fill="item.color" style="text-align:center">{{item.label}}</text>
            </template>
        </svg>
    </div>
</template>
<script>
export default {
    props: ["tempChartData"],
    data() {
        return{

        }
    },
    methods: {

    }
}
</script>