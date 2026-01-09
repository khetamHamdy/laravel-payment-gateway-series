(function ($) {
    // My edit in the table
    $("#filter-btn").click(function () {
        $("div#filter-div").slideToggle();
    });
    $(".name-filter, #search").on("input click", function (e) {
        $.ajax({
            url: app_link + "employees/filterEmployee",
            method: "post",
            data: {
                name: $('input[name="name"]').val(),
                employee_id: $('input[name="employee_id"]').val(),
                gender: $('input[name="gender"]').val(),
                matrimonial_status: $('input[name="matrimonial_status"]').val(),
                scientific_qualification: $('input[name="scientific_qualification"]').val(),
                area: $('input[name="area"]').val(),
                working_status: $('input[name="working_status"]').val(),
                type_appointment: $('input[name="type_appointment"]').val(),
                field_action: $('input[name="field_action"]').val(),
                dual_function: $('input[name="dual_function"]').val(),
                state_effectiveness: $('input[name="state_effectiveness"]').val(),
                nature_work: $('input[name="nature_work"]').val(),
                association: $('input[name="association"]').val(),
                workplace: $('input[name="workplace"]').val(),
                section: $('input[name="section"]').val(),
                dependence: $('input[name="dependence"]').val(),
                establishment: $('input[name="establishment"]').val(),
                payroll_statement: $('input[name="payroll_statement"]').val(),
                _token: csrf_token,
            },
            success: function (response) {
                $("#table_employees").empty();
                $("#links_pages").remove();
                response.forEach((employee) => {
                    $("#table_employees").append(
                        `<tr>
                            <td>${response.indexOf(employee) + 1}</td>
                            <td>`+ employee['name'] +`</td>
                            <td>`+ employee['employee_id'] +`</td>
                            <td>`+ employee['work_data']['type_appointment'] +`</td>
                            <td>`+ employee['work_data']['association'] +`</td>
                            <td>`+ employee['work_data']['workplace'] +`</td>
                            <td>`+ employee['work_data']['field_action'] +`</td>
                            <td>`+ employee['work_data']['number_working_days'] +`</td>
                            <td>`+ employee['matrimonial_status'] +`</td>
                            <td>`+ employee['work_data']['allowance'] +`</td>
                            <td>`+ employee['work_data']['grade'] +`</td>
                            <td>`+ employee['work_data']['state_effectiveness'] +`</td>
                            <td>`+ employee['age'] +`</td>
                            <td>`+ employee['phone_number'] +`</td>
                            <td>`+ employee['area'] +`</td>
                            <td>`+ employee['scientific_qualification'] +`</td>
                            <td id="`+ employee["id"] +`">
                                <button class="btn btn-sm dropdown-toggle more-horizontal"
                                    type="button" data-bs-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false">
                                    <span class="text-muted sr-only">Action</span>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item"
                                        style="margin: 0.5rem -0.75rem; text-align: right;"
                                        href="` + app_link + `employees/`+ employee['id'] +`/edit">تعديل</a>
                                    <form action="` + app_link + `employees/`+ employee['id'] +`"
                                        method="post">
                                        <input type="hidden" name="_token" value="`+ csrf_token +`" autocomplete="off">
                                        <input type="hidden" name="_method" value="delete">
                                        <button type="submit" class="dropdown-item"
                                            style="margin: 0.5rem -0.75rem; text-align: right;"
                                            href="#">حذف</button>
                                    </form>
                                </div>
                            </td>
                    </tr>`
                    );
                });
            },
            error: function (response) {
                console.error(response);
            },
        });
    });
})(jQuery);
