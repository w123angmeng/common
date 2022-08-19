<template>
<div class='hospitalTitle' ref="hospitalTitle">
    <p class="hospitalName">{{selHospital}}</p>
    <!-- <p class="tempTitle">体温表</p> -->
    <div class="patinfoDiv"> 
        <p class="p"><span>姓名 </span><span>{{selPatientList.name}}</span></p>
        <p class="p"><span>性别 </span><span>{{selPatientList.sex}}</span></p>
        <p class="p"><span>年龄 </span><span>{{selPatientList.age}}</span></p>
        <p class="p"><span>病区 </span><span>{{selPatientList.wardName ? selPatientList.wardName : ''}}</span></p>
        <p class="p"><span>床号 </span><span>{{selPatientList.bedNo}}</span></p>
        <p class="p"><span>入院日期 </span><span>{{selPatientList.admissionDateTime}}</span></p>
        <p class="p"><span>病案号 </span><span>{{selPatientList.inpNo}}</span></p>
    </div>
</div>
</template>
<script>
export default {
    name:"patientinfo",
    props:["hospital","patientList"],
    data(){
        return{
            selHospital:"",
            selPatientList:[],
        }
    },
    created(){
        this.selHospital = this.hospital;
        this.selPatientList = this.patientList;
    },
    mounted() {
        // console.log(this.$refs.hospitalTitle.clientHeight)
        this.$emit("getHeaderH", this.$refs.hospitalTitle.offsetHeight);
    },
    methods:{

    },
}
</script>
<style  lang="scss">
  /* @import '../assets/styles/app.scss'; */
    // .hospitalName{
    //     text-align: center;
    //     font-size: 20px;
    //     margin-bottom: 20px;
    // }
    // .tempTitle{
    //     text-align: center;
    //     font-size: 16px;
    // }
    // .patinfoDiv{
    //     margin-bottom: 10px;
    //     overflow: hidden;
    //     display: flex;
    // }
    // .p{
    //     margin: 0 8px 0 0;
    //     font-size:14px;
    //     float: left;
    //     padding: 0;
    //     max-width: 180px;
    //     overflow: hidden;
    //     white-space:nowrap;
    //     text-overflow:ellipsis;
    // }
</style>


