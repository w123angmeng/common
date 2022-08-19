import elementResizeDetectorMaker from 'element-resize-detector'
export const mixinCheckDiagnosis = {
    data(){
        return {
            drugDetails: {},
            systemInfo: '', // 系统信息--开医嘱
            systemInfoState: false, // 系统信息--开医嘱 详细
        }
    },
    computed:{
        idDiagnosisList(){
            return this.reimbursement.diagnosisType.filter(v=>v.idDiagnosis).map(curr => curr.idDiagnosis)
        },
        getDrugsDiagnosisDetail(){
            let map = new Map();
            for(const [key,value] of Object.entries(this.drugDetails)){
                map.set(key,value)
            }
            return map;
        },
        getDiagnosisName(){
            return this.reimbursement.diagnosisType.map(curr => curr.diagnosisName).join('、')
        },
        getTabooMsg(){
            let map = new Map();
            this.reimbursement.diagnosisType.filter(v=>v.idDiagnosis).map(item =>{
                map.set(item.idDiagnosis, item)
            }) 
            return map;
        }
    },
    created(){
       
    },
    methods:{
        // 查询诊断分组适应症 禁忌药
        findClassClinicByIdClinicItems(idClinicItemList, patInfo){
            this.drugDetails = {};
            return this.$axios._post("/dict/diagClass/findClassClinicByIdClinicItems", {
                idClinicItemList: idClinicItemList,
                idDiagnosisList: this.idDiagnosisList,
                dtBirth: patInfo.dtBirth,   //生日
                sdSex: patInfo.sdSex,     //性别
            }).then(res=>{
                if(res.success){
                    if(Object.keys(res.data).length){
                        this.drugDetails = res.data;
                    }
                }else{
                    this.$message({
                        type: "error",
                        message: res.message,
                    });
                }
            }).then(() =>{
                let data = Object.keys(this.drugDetails)[0];
                let description=''
                if(data){
                    this.getDrugsDiagnosisDetail.get(data).map(v=>{
                        description += v && this.showMessageTitle(v)
                    })
                    this.systemInfo = description;
                    this.getWidth(description);
                }
                return !!Object.keys(this.drugDetails).length;
            })
        },
        showMessageTitle(v){
            let str = '';
            if(v.sdDiagnosisClassType == '4'){
                str += `【不适症】与临床诊断（${this.getDiagnosisName}）不相关，可能存在超适应症用药；`
            }
            if(v.sdDiagnosisClassType == '5'){
                let title = v.idDiagnosisList.reduce((arr,ele)=>{
                    arr.push(this.getTabooMsg.get(ele).diagnosisName)
                    return arr;
                },[])
                str += `【禁忌】与临床诊断（${title.join('、')}）存在禁忌反应，可能存在禁忌用药；`
            }
            return str;
        },
        // 自适应展示详情
        getWidth(description){
            if(!description) return;
            let that = this
            // 仅用于开医嘱展示系统信息自适应
            if(document.getElementById("systemInfo")){
                let erd = elementResizeDetectorMaker()
                return erd.listenTo(document.getElementById("systemInfo"), function(element) {
                    let sysDom = document.getElementById("systemInfoMsg");
                    let info = sysDom && sysDom.offsetWidth
                    let sys = document.getElementById("systemInfo").offsetWidth
                    if ((info+80) >= sys) {
                        that.systemInfoState = true;
                    }else {
                        that.systemInfoState = false;
                    }
                });
            }
        }
    }
}