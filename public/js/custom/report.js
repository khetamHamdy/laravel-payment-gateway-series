(function($){
    $(".employee_fields_search").on("input", function (e) {
        let employeeId = $('#employee_id_search').val();
        let employeeName = $('#employee_name_search').val();
        $.ajax({
            url: app_link + "employees/getEmployee", //data-id
            method: "get",
            data: {
                employeeId: employeeId,
                employeeName: employeeName,
                _token: csrf_token,
            },
            success: function (response) {
                $("#table_employee").empty();
                if (response.length != 0) {
                    for (let index = 0; index < response.length; index++) {
                        $("#table_employee").append(
                            "<tr class='employee_select' data-name='" +response[index]["name"] +"' data-id=" +response[index]["id"] +"><th scope='row'>" +
                                response[index]["id"] +
                                "</th><td>" +
                                response[index]["employee_id"] +
                                "</td><td>" +
                                response[index]["name"] +
                                "</td><td>" +
                                response[index]["date_of_birth"] +
                                "</td></tr>"
                        );
                    }
                }else{
                    $("#table_employee").append(
                        "<tr><td colspan='3'>يرجى التأكد من صحة البيانات</td></tr>"
                    );
                }
            },
        });
    });
    $(".table-hover").delegate("tr.employee_select", "click", function () {
        let employee_id_select = $(this).data("id");
        let employee_name_select = $(this).data("name");
        $("input[name=employee_id]").val(employee_id_select);
        $('#nameEmployee').text(employee_name_select);
        $('#report_warning').text(employee_name_select);
        $("#searchEmployee").modal("toggle");
    });
    $('form').on('submit',function(e){
        e.preventDefault();
        let type = $("#report_type option:selected").attr('type');
        if(type == "employee"){
            if($("input[name=employee_id]").val() == ''){
                $('#report_warning').text('يرجى تحديد الموظف أولا قبل تصدير التقرير');
                return false;
            }
        }
        this.submit();
    });
    $('#report_type').on('change', function() {
        let report_type = $(this).val();
        let type = $("#report_type option:selected").attr('type');
        if(type == "employee"){
            $('#searchEmployee').modal('show');
            $("input[name=employee_id]").attr('required',true);
            $('#serchEmployee').slideDown();
        }else{
            $('#serchEmployee').slideUp();
            $("input[name=employee_id]").removeAttr('required');
        }
    })
    $("#report_type").on('change',function () {
        let type = $(this).val();
        if(type == "bank"){
            $("div#bankDiv").slideDown();
        }
        else{
            $("div#bankDiv").slideUp();
        }
    });
    $("#exchange_type").on('change',function () {
        let type = $(this).val();
        if(type == "bank"){
            $("div#bank_select").slideDown();
        }
        else{
            $("div#bank_select").slideUp();
        }
    });
})(jQuery);
