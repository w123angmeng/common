function checkPermission(el, binding) {
    const { value } = binding;
    const enabledBtnObj = JSON.parse(sessionStorage.getItem("enabledBtn") || {});
    // NOTE:接口返回的是 没有权限的按钮对象  只要对象里的key 就不显示
    // 获取到没有按钮权限的 Map
    const noRoles = Object.keys(enabledBtnObj)
    // console.log("checkPermissionMoRolesBtnCodes", value, noRoles);
    if (value && value instanceof Array) {
        if (value.length > 0) {
            const permissionRoles = value;
            // 如果无权限按钮集合 包括 此按钮的指令中的 code 则无权限
            // 判断按钮赋值的数组 是否是 所有无权限按钮的 子集 如果是 则无权限不显示
            // const noPermission = noRoles.some((role) => {
            //     return permissionRoles.includes(role);
            // });
            const noPermission = permissionRoles.every((role) => {
                return noRoles.includes(role);
            });
            if (noPermission) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        }
    } else {
        throw new Error(`权限按钮指令绑定出错了~`);
    }
}

export default {
    inserted(el, binding) {
        checkPermission(el, binding);
    },
    update(el, binding) {
        checkPermission(el, binding);
    },
};
