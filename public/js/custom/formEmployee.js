(function($){
    // date change
    $("input[name='date_of_birth']").on("input", function() {
        let date_of_birth = $(this).val();
        let thisYear = new Date().getFullYear();
        let year_of_birth = new Date(date_of_birth).getFullYear();
        $("input[name='age']").val(thisYear - year_of_birth);
        let futureDate = new Date(date_of_birth);
        futureDate.setFullYear(futureDate.getFullYear() + 60);
        $("input[name='date_retirement']").val(futureDate.toISOString().split('T')[0]);
    });

    $("input[name='date_installation']").on("input", function() {
        let thisYear = new Date().getFullYear();
        let date_installation = new Date($(this).val()).getFullYear();
        $("input[name='years_service']").val(thisYear - date_installation);
    });

    // type_appointment change
    let type_appointment = function () {
        let type = $('#type_appointment').val();
        if (type == "مثبت") {
            $("div#proven").slideDown();
            $("div#notProven").slideUp();
            $("div#daily").slideUp();
            $('#proven').find('input.required,select.required').each(function () {
                $(this).prop('required', true);
            });
        }else{
            $('#proven').find('input.required,select.required').each(function () {
                $(this).prop('required', false);
            });
            $("div#proven").slideUp();
        }
        if (type == "يومي") {
            $("div#daily").slideDown();
        }else{
            $("div#daily").slideUp();
        }
        if (type != "مثبت" && type != "نسبة" && type != "يومي" && type != null) {
            $("div#notProven").slideDown();
        }else{
            $("div#notProven").slideUp();
        }
    };
    $("#type_appointment").on('change',function () {
        type_appointment();
    });
    type_appointment();

    // type_appointment == 'daily'
    let number_of_days = 0;
    let today_price = 0;
    $('.daily_fields').on('input', function() {
        let name = $(this).data("name");
        if (name == 'number_of_days') {
            number_of_days = $(this).val();
        }
        if (name == 'today_price') {
            today_price = $(this).val();
        }
        let total = number_of_days * today_price;
        $("input[name='specificSalary']").val(total)
    });

    // form submit
    $.validator.messages.required = "هذا الحقل مطلوب";
    $("#myForm").validate({
        rules: {
            name: {
                required: true,
                maxlength: 255,
            }
        },
        messages: {
            name: "يرجى إدخال اسم المستخدم",
        }
    });
    $('.prev').click(function() {
        let tabIndex = $(this).data('num') - 1;
        $('.nav-link').removeClass('active');

        $('#tab' + (tabIndex)).addClass('active');

        $('.tab-pane').removeClass('active show');
        $('.tab-pane').addClass('fade');

        $('#menu' + (tabIndex)).removeClass('fade');
        $('#menu' + (tabIndex)).addClass('show active');
    });
    $('.next').click(function() {
        // التحقق من صحة الحقول في التاب الحالي باستخدام jQuery Validation
        let currentTab = $(this).closest('.tab-pane');
        let form = $('#myForm'); // اختر النموذج بشكل عام
        let isValid = true;
        // تحقق من صحة النموذج
        form.find('.tab-pane').each(function() {
            if ($(this).hasClass('active')) {
                // التحقق من صحة الحقول في التاب الحالي فقط
                isValid = form.validate().form(); // تحقق من صحة النموذج
            }
        });

        // إذا كانت جميع الحقول صحيحة
        if (isValid) {
            // الانتقال إلى التاب التالي
            let tabIndex = $(this).data('num') + 1;

            // إزالة التفعيل من التابات السابقة
            $('.nav-link').removeClass('active');
            $('#tab' + tabIndex).addClass('active');

            // تغيير محتوى التاب الحالي
            $('.tab-pane').removeClass('show active').addClass('fade');
            $('#menu' + tabIndex).removeClass('fade').addClass('show active');
            $('#alerts').slideUp();
        } else {
            // إذا كانت هناك أخطاء، لا تواصل
            $('#alerts').slideDown();
            $('#alerts').text("يرجى تصحيح الأخطاء في النموذج قبل المتابعة.");
        }
    });
    $('.nav-pills .nav-item .nav-link').click(function(e) {
        let form = $('#myForm'); // اختر النموذج
        let isValid = true;
        // تحقق من صحة التبويب النشط فقط
        form.find('.tab-pane.active').each(function() {
            isValid = form.validate().form(); // تحقق من صحة الحقول
        });

        // تجاوز التحقق إذا كانت association تساوي 'حيفا'
        if (association === 'حيفا') {
            isValid = true;
        }
        if(state_effectiveness == 'وقف'){
            isValid = true;
        }

        if (isValid) {
            $('#alerts').slideUp();
        } else {
            e.preventDefault(); // يمنع الإجراء الافتراضي
            e.stopPropagation(); // يمنع انتشار الحدث

            $('#alerts').slideDown().text("يرجى تصحيح الأخطاء في النموذج قبل المتابعة.");
        }
    });

    $('#myForm').submit(function(e) {
        e.preventDefault();
        let isValid = true;
        let form = $('#myForm');
        form.find('.tab-pane').each(function() {
            $('.tab-pane').removeClass('active show');
            $('.nav-link').removeClass('active');
            $(this).addClass('active show');
            $('#tab' + $(this).data('num')).addClass('active');
            isValid = form.validate().form();

            if (isValid) {
                $('#alerts').slideUp();
            } else {
                e.preventDefault();
                e.stopPropagation();
                $('#alerts').slideDown().text("يرجى تصحيح الأخطاء في النموذج قبل المتابعة.");
                return false; // ⬅️ هذا يوقف اللوب
            }
        });
        if(isValid){
            this.submit();
        }
    });

    let num_account = num_accounts;
    let banks_array  = banks;
    $('#add_bank').on('click', function() {
        let options = banks_array.map(bank => `<option value="${bank.id}">${bank.name} - ${bank.branch}</option>`).join('');
        $('#accounts').append(`
            <div class="row" id="accout-${num_account + 1}">
                <div class="my-2 col-2 d-flex align-items-center">
                    <span class="display-6" style="font-size: 18px;" id="account-${num_account + 1}">بيانات الحساب  : ${num_account + 1}</span>
                </div>
                <div class="my-2 col-md-4">
                    <label for="bank_id-${num_account + 1}" class="form-label" >البنك - الفرع</label>
                    <select class="form-select" id="bank_id-${num_account + 1}" name="bank_id-${num_account + 1}" required>
                        <option value="" selected>عرض القيم المتوفرة</option>
                        ${options}
                    </select>
                </div>
                <div class="my-2 col-md-4">
                    <label class="form-label" for="account_number-${num_account + 1}">
                        رقم الحساب
                    </label>
                    <input type="text" id="account_number-${num_account + 1}" name="account_number-${num_account + 1}" value="" class="form-control" maxlength="9" placeholder="4000000" required>
                </div>
                <div class="my-2 col-md-1 d-flex align-items-center">
                    <div class="switches-stacked">
                        <label class="switch">
                            <input type="radio" class="switch-input" name="default" value="${num_account + 1}" id="default-${num_account + 1}" ${num_account == 0 ? 'checked' : ''}>
                            <span class="switch-toggle-slider">
                                <span class="switch-on"></span>
                                <span class="switch-off"></span>
                            </span>
                            <span class="switch-label">أساسي</span>
                        </label>
                    </div>
                </div>
                <div class="my-2 col-1 d-flex align-items-center justify-content-end">
                    <button type="button" id="delete_bank-${num_account + 1}" data-num="${num_account + 1}" class="btn btn-icon btn-sm delete_bank" style="font-size: 18px;" title="حذف الحساب">
                        <i class="fa-solid fa-trash-can text-danger"></i>
                    </button>
                </div>
            </div>
        `);

        num_account += 1;
        $('#num_accounts').val(num_account);
    });

    $(document).on('click', '.delete_bank', function() {
        let num_account_delete = $(this).data('num');
        $('#accout-' + num_account_delete).remove();
        num_account -= 1;
        $('#num_accounts').val(num_account);
    });
})(jQuery);

