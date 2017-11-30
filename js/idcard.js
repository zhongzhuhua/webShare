// 身份证校验
// var reg= /^\+?[1-9][0-9]*$/;
var reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}(\d|X)$/i;
var clstypelen = val.length,
    docvalue = val,
    docvaluesp = docvalue.split(""),
    homonum = ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2"],
    sum = 0,
    retuNum = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
if (clstypelen != 15 && clstypelen != 18) {
    return "请输入正确的身份证号"
}
if (clstypelen == 18) {
    if (!reg.test(docvalue)) {
        return "请输入正确的身份证号"
    }
    for (var i = 0; i < 17; i++) {
        sum += docvaluesp[i] * homonum[i];
    }
    if (retuNum[sum % 11] != docvalue.charAt(17)) {
        return "请输入正确的身份证号"
    }
}
