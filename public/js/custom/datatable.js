$(document).ready(function () {
    let formatNumber = (number, min = 0) => {
        // التحقق إذا كانت القيمة فارغة أو غير صالحة كرقم
        if (number === null || number === undefined || isNaN(number)) {
            return ""; // إرجاع قيمة فارغة إذا كان الرقم غير صالح
        }
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: min,
            maximumFractionDigits: 2,
        }).format(number);
    };
    function getActiveColumnFilters() {
        let filters = {};

        // دور على كل الفلاتر النشطة
        $('input[type="checkbox"]:checked').each(function () {
            let className = $(this).attr("class");
            let value = $(this).val();

            // تجاهل قيمة "الكل" أو أي قيم خاصة
            if (value === "الكل" || value === "all" || value === "All") {
                return; // تخطى هذا العنصر
            }

            // استخرج اسم الفيلد من الكلاس
            let fieldMatch = className.match(/(\w+)-checkbox/);
            if (fieldMatch) {
                let fieldName = fieldMatch[1];
                if (!filters[fieldName]) {
                    filters[fieldName] = [];
                }
                filters[fieldName].push(value);
            }
        });

        return filters;
    }
    function getActiveColumnFiltersExcept(excludeColumnIndex) {
        let filters = {};

        $('input[type="checkbox"]:checked').each(function () {
            let className = $(this).attr("class");
            let value = $(this).val();

            // تجاهل "الكل"
            if (value === "الكل" || value === "all" || value === "All") {
                return;
            }

            // استخراج اسم الحقل
            let fieldMatch = className.match(/(\w+)-checkbox/);
            if (fieldMatch) {
                let fieldName = fieldMatch[1];

                // تجاهل العمود الحالي
                let fieldIndex = fields.indexOf(fieldName);
                if (fieldIndex === excludeColumnIndex) {
                    return;
                }

                if (!filters[fieldName]) {
                    filters[fieldName] = [];
                }
                filters[fieldName].push(value);
            }
        });

        return filters;
    }
    const table = $("#" + tableId).DataTable({
        processing: true,
        serverSide: true,
        responsive: true,
        paging: true, // تفعيل الترقيم
        pageLength: pageLength, // عدد الصفوف في الصفحة الواحدة
        searching: true,
        info: true, // إظهار معلومات الصفحات
        lengthChange: true, // إظهار قائمة تغيير عدد المدخلات
        language: {
            url: arabicFileJson,
            // إضافة ترجمات مخصصة للـ pagination
            paginate: {
                first: "الأولى",
                last: "الأخيرة",
                next: "التالي",
                previous: "السابق",
            },
            info: "عرض _START_ إلى _END_ من أصل _TOTAL_ عنصر",
            infoEmpty: "عرض 0 إلى 0 من أصل 0 عنصر",
            infoFiltered: "(تصفية من _MAX_ عنصر إجمالي)",
            lengthMenu: "عرض _MENU_ عنصر",
            zeroRecords: "لا توجد سجلات مطابقة",
            emptyTable: "لا توجد بيانات متاحة في الجدول",
            processing: "جاري المعالجة...",
        },
        ajax: {
            url: urlIndex,
            data: function (d) {
                // إضافة تواريخ التصفية إلى الطلب المرسل
                d.from_date = $("#from_date").val();
                d.to_date = $("#to_date").val();
                d.type = $("#type").val();

                d.column_filters = getActiveColumnFilters();
            },
            error: function (xhr, status, error) {
                console.error("AJAX error:", status, error);
            },
        },
        columns: columnsTable,
        columnDefs: [
            { targets: 1, searchable: false, orderable: false }, // تعطيل الفرز والبحث على عمود الترقيم
        ],
        dom:
            '<"top"<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>>' +
            '<"table-responsive"t>' +
            '<"bottom"<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>>',
    });
    $(document).on("change", "#advanced-pagination", function () {
        table.page.len($(this).val()).draw();
    });
    // دالة لتغيير نصوص الأزرار لأسهم
    function updatePaginationButtons() {
        // تغيير السابق والتالي لأسهم
        $(".dt-paging-button.previous").html(
            '<i class="fas fa-chevron-right"></i>'
        );
        $(".dt-paging-button.next").html('<i class="fas fa-chevron-left"></i>');
    }
    // نسخ وظيفة الزر إلى الزر المخصص
    $(document).on("click", "#excel-export", function () {
        table.button(".buttons-excel").trigger(); // استدعاء وظيفة الزر الأصلي
    });
    $(document).on("click", "#print-btn", function () {
        table.button(".buttons-print").trigger(); // استدعاء وظيفة الطباعة الأصلية
    });
    $("#" + tableId + "_filter").addClass("d-none");
    // جلب الداتا في checkbox
    // إضافة endpoint جديد للحصول على قيم الفلاتر
    // جلب الداتا في checkbox
    function populateFilterOptions(columnIndex, container, name) {
        const columnName = fields[columnIndex];

        let activeFilters = getActiveColumnFiltersExcept(columnIndex);

        $.ajax({
            url: urlFilters.replace(":column", columnName),
            data: {
                from_date: $("#from_date").val(),
                to_date: $("#to_date").val(),
                type: $("#type").val(),
                active_filters: activeFilters
            },
            success: function (uniqueValues) {
                uniqueValues.sort();

                const checkboxList = $(container);
                checkboxList.empty();

                uniqueValues.forEach((value) => {
                    checkboxList.append(`
                        <label style="display: block;">
                            <input type="checkbox" value="${value}" class="${name}-checkbox"> ${value}
                        </label>
                    `);
                });
            },
            error: function (xhr) {
                console.error("خطأ في تحميل خيارات الفلترة", xhr);
            }
        });
    }
    function isColumnFiltered(columnIndex) {
        const filterValue = table.column(columnIndex).search();
        return filterValue !== ""; // إذا لم يكن فارغًا، الفلترة مفعلة
    }
    function updateFilterButtonsStyle() {
        for (let i = 0; i < fields.length; i++) {
            let hasActiveFilter = false;

            if(fields[i] == '#' || fields[i] == 'edit' || fields[i] == 'delete'){
                continue; // استخدم continue مش return
            }

            // فحص إذا كان هناك checkboxes محددة لهذا الحقل
            $("." + fields[i] + "-checkbox:checked").each(function() {
                let value = $(this).val();
                if (value !== "الكل" && value !== "all" && value !== "All") {
                    hasActiveFilter = true;
                    return false; // توقف عن البحث
                }
            });

            // فحص فلتر التاريخ (بنفس طريقتك)
            if (fields[i] === 'implementation_date') {
                if ($("#from_date").val() || $("#to_date").val()) {
                    hasActiveFilter = true;
                }
            }

            let btnId = "#btn-filter-" + i;

            if (hasActiveFilter) {
                // الفلتر نشط - غير اللون والأيقونة
                $(btnId).removeClass("btn-secondary").addClass("btn-success");
                $(btnId + " i")
                    .removeClass("fa-solid fa-filter") // أضيف fa-solid
                    .addClass("fa-brands fa-get-pocket"); // أضيف fa-brands
            } else {
                // الفلتر غير نشط - اللون الافتراضي
                $(btnId).removeClass("btn-success").addClass("btn-secondary");
                $(btnId + " i")
                    .removeClass("fa-brands fa-get-pocket") // أضيف fa-brands
                    .addClass("fa-solid fa-filter"); // أضيف fa-solid

            }
        }
    }
    // إزالة auto-reload وتحميل عند فتح dropdown فقط
    $(document).on('show.bs.dropdown', '.enhanced-filter-dropdown', function() {
        let button = $(this).find('.btn-filter');
        let btnId = button.attr('id');
        let index = parseInt(btnId.replace('btn-filter-', ''));
        let field = fields[index];

        if(field == '#' || field == 'edit' || field == 'delete'){
            return;
        }

        let hasActiveFilter = false;
        $("." + field + "-checkbox:checked").each(function() {
            let value = $(this).val();
            if (value !== "الكل" && value !== "all" && value !== "All") {
                hasActiveFilter = true;
                return false;
            }
        });

        if(!hasActiveFilter && !isColumnFiltered(index)){
            populateFilterOptions(index, ".checkbox-list-" + index, field);
        }
    });
    // تبسيط rebuildFilters
    function rebuildFilters() {
        updateFilterButtonsStyle(); // فقط تحديث الأزرار
    }
    table.on("draw", function () {
        rebuildFilters();
        // تطبيق التغييرات في البداية
        updatePaginationButtons();
        // تغيير السابق والتالي لأسهم
        $('.dt-paging-button.previous').html('<i class="fas fa-chevron-right"></i>');
        $('.dt-paging-button.next').html('<i class="fas fa-chevron-left"></i>');
    });
    // // تطبيق الفلترة عند الضغط على زر "check"
    $(".filter-apply-btn").on("click", function () {
        let target = $(this).data("target");
        let field = $(this).data("field");
        var filterValue = $("input[name=" + field + "]").val();
        table.column(target).search(filterValue).draw();
    });
    // منع إغلاق dropdown عند النقر على input أو label
    $("th  .dropdown-menu .checkbox-list-box").on("click", function (e) {
        e.stopPropagation(); // منع انتشار الحدث
    });
    // البحث داخل الـ checkboxes
    $(document).on("input", ".search-checkbox", function () {
        let searchValue = $(this).val().toLowerCase();
        let tdIndex = $(this).data("index");
        $(".checkbox-list-" + tdIndex + " label").each(function () {
            let labelText = $(this).text().toLowerCase(); // النص داخل الـ label
            let checkbox = $(this).find("input"); // الـ checkbox داخل الـ label

            if (labelText.indexOf(searchValue) !== -1) {
                $(this).show();
            } else {
                $(this).hide();
                if (checkbox.prop("checked")) {
                    checkbox.prop("checked", false); // إذا كان الـ checkbox محددًا، قم بإلغاء تحديده
                }
            }
        });
    });
    $(document).on("change", ".all-checkbox", function () {
        let index = $(this).data("index"); // الحصول على الـ index من الـ data-index

        // التحقق من حالة الـ checkbox "الكل"
        if ($(this).prop("checked")) {
            // إذا كانت الـ checkbox "الكل" محددة، تحديد جميع الـ checkboxes الظاهرة فقط
            $(
                ".checkbox-list-" + index + ' input[type="checkbox"]:visible'
            ).prop("checked", true);
        } else {
            // إذا كانت الـ checkbox "الكل" غير محددة، إلغاء تحديد جميع الـ checkboxes الظاهرة فقط
            $(
                ".checkbox-list-" + index + ' input[type="checkbox"]:visible'
            ).prop("checked", false);
        }
    });
    function escapeRegex(value) {
        return value.replace(/[-\/\\^$*+?.()|[\]{}"'`]/g, "\\$&"); // تشمل الآن علامات الاقتباس المفردة والمزدوجة
    }
    $(document).on("click", ".filter-apply-btn-checkbox", function () {
        table.ajax.reload();
        updateClearFilterButton();
        updateFilterButtonsStyle();
        // let target = $(this).data("target"); // استرجاع الهدف (العمود)
        // let field = $(this).data("field"); // استرجاع الحقل (اسم المشروع أو أي حقل آخر)

        // // الحصول على القيم المحددة من الـ checkboxes
        // var filterValues = [];
        // // نستخدم الكلاس المناسب بناءً على الحقل (هنا مشروع)
        // $("." + field + "-checkbox:checked").each(function () {
        //     filterValues.push($(this).val()); // إضافة القيمة المحددة
        // });
        // // إذا كانت هناك قيم محددة، نستخدمها في الفلترة
        // if (filterValues.length > 0) {
        //     // تحويل القيم إلى تعبير نمطي مع إلغاء حجز الرموز الخاصة
        //     var searchExpression = filterValues.map(escapeRegex).join("|");
        //     // تطبيق الفلترة على العمود باستخدام القيم المحددة
        //     table.column(target).search(searchExpression, true, false).draw(); // Use regex search
        //     // استخدام البحث النصي العادي (regex: false)
        // } else {
        //     // إذا لم تكن هناك قيم محددة، نعرض جميع البيانات
        //     table.column(target).search("").draw();
        // }
    });
    // تطبيق التصفية عند النقر على زر "Apply"
    $(document).on("click", "#filter-date-btn", function () {
        const fromDate = $("#from_date").val();
        const toDate = $("#to_date").val();
        table.ajax.reload(); // إعادة تحميل الجدول مع التواريخ المحدثة
    });
    // تفويض حدث الحذف على الأزرار الديناميكية
    let deleteItemId = null;

    $(document).on("click", ".delete_row", function () {
        deleteItemId = $(this).data("id");
        $("#deleteConfirmModal").modal("show");
    });

    $(document).on("click", "#confirmDeleteBtn", function () {
        if (deleteItemId) {
            deleteRow(deleteItemId);
            $("#deleteConfirmModal").modal("hide");
            deleteItemId = null;
        }
    });
    // وظيفة الحذف
    function deleteRow(id) {
        $.ajax({
            url: urlDelete.replace(":id", id),
            method: "DELETE",
            data: {
                _token: _token,
            },
            success: function (response) {
                toastr.success("تم حذف العنصر بنجاح");
                table.ajax.reload(); // إعادة تحميل الجدول بعد الحذف
            },
            error: function (xhr, status, error) {
                console.error("AJAX error:", status, error);
                toastr.error("هنالك خطاء في عملية الحذف.");
            },
        });
    }
    $(document).on("click", "#refreshData", function () {
        table.ajax.reload();
    });
    function hasActiveFilters() {
        let hasFilters = false;

        // فحص فلاتر الـ checkboxes
        $('input[type="checkbox"]:checked').each(function () {
            let value = $(this).val();
            if (value !== "الكل" && value !== "all" && value !== "All") {
                hasFilters = true;
                return false; // توقف عن البحث
            }
        });

        // فحص فلاتر التواريخ والنوع
        if ($("#from_date").val() || $("#to_date").val() || $("#type").val()) {
            hasFilters = true;
        }

        return hasFilters;
    }
    function updateClearFilterButton() {
        if (hasActiveFilters()) {
            $("#filterBtnClear").removeClass("d-none"); // إظهار الزر
        } else {
            $("#filterBtnClear").addClass("d-none"); // إخفاء الزر
        }
    }
    $(document).on("click", "#filterBtnClear", function () {
        // مسح جميع الـ checkboxes
        $('input[type="checkbox"]').prop("checked", false);

        // مسح فلاتر التواريخ والنوع
        $("#from_date").val("");
        $("#to_date").val("");
        $("#type").val("");

        // مسح فلاتر الأعمدة
        table.columns().search("");

        // إعادة تحميل الجدول
        table.ajax.reload(null, false);

        // إخفاء الزر
        $("#filterBtnClear").addClass("d-none");

        // إعادة تعيين شكل أزرار الفلاتر
        for (let i = 0; i < fields.length; i++) {
            $("#btn-filter-" + i)
                .removeClass("btn-success")
                .addClass("btn-secondary");
            $("#btn-filter-" + i + " i")
                .removeClass("fa-solid fa-filter")
                .addClass("fa-brands fa-get-pocket");
        }
    });
    // لما يتغير فلتر التاريخ أو النوع
    $("#from_date, #to_date, #type").on("change", function () {
        updateClearFilterButton();
    });

    // عند تحميل الصفحة
    $(document).ready(function () {
        updateClearFilterButton();
    });

    // عند إعادة تحميل الجدول
    table.on("xhr", function () {
        setTimeout(updateClearFilterButton, 100);
    });
});

$(document).ready(function () {
    $(document).on("click", "#filterBtn", function () {
        let text = $(this).text();
        if (text != "تصفية") {
            $(this).text("تصفية");
        } else {
            $(this).text("إخفاء التصفية");
        }
        $(".filter-dropdown").slideToggle();
    });
    $(document).on("click", "#import_excel_btn", function () {
        $("#editEmployee").modal("hide");
        $("#import_excel").modal("show");
    });
});

$(document).ready(function () {
    let currentRow = 0;
    let currentCol = 0;

    // الحصول على الصفوف من tbody فقط
    const rows = $("#" + tableId + " tbody tr");

    // إضافة الكلاس للخلايا عند تحميل الصفحة
    highlightCell(currentRow, currentCol);

    // التنقل باستخدام الأسهم
    $(document).on("keydown", function (e) {
        // تحديث عدد الصفوف والأعمدة المرئية عند كل حركة
        const totalRows = $("#" + tableId + " tbody tr:visible").length;
        const totalCols = $("#" + tableId + " tbody tr:visible")
            .eq(0)
            .find("td").length;

        // التحقق من وجود صفوف وأعمدة لتجنب NaN
        if (totalRows === 0 || totalCols === 0) return;

        // التنقل باستخدام الأسهم
        if (e.key === "ArrowLeft") {
            if (currentCol < 32) {
                currentCol = (currentCol + 1) % totalCols;
            }
        } else if (e.key === "ArrowRight") {
            if (currentCol > 0) {
                currentCol = (currentCol - 1 + totalCols) % totalCols;
            }
        } else if (e.key === "ArrowDown") {
            currentRow = (currentRow + 1) % totalRows;
        } else if (e.key === "ArrowUp") {
            // إذا كنت في الصف الأول، لا تفعل شيئاً
            if (currentRow > 0) {
                currentRow = (currentRow - 1 + totalRows) % totalRows;
            }
        } else {
            return;
        }
        highlightCell(currentRow, currentCol);
    });

    // التحديد عند النقر المزدوج بالماوس
    $("#" + tableId + " tbody").on("dblclick", "td", function () {
        const cell = $(this);
        currentRow = cell.closest("tr").index();
        currentCol = cell.index();
        highlightCell(currentRow, currentCol);
    });

    // دالة لتحديث الخلية النشطة
    function highlightCell(row, col) {
        // استهداف الصفوف المرئية فقط
        const visibleRows = $("#" + tableId + " tbody tr:visible");
        // التحقق من وجود الصف
        if (visibleRows.length > row) {
            // تحديد الصف والخلية المطلوبة
            const targetRow = visibleRows.eq(row);
            const targetCell = targetRow.find("td").eq(col);
            if (targetCell.length) {
                // إزالة التنسيقات السابقة
                $("#" + tableId + " tbody td").removeClass("active");
                // إضافة التنسيق للخلية المطلوبة
                targetCell.addClass("active");
                targetCell.focus();
            }
        }
    }
});

// إضافة تأثيرات تفاعلية
document.addEventListener("DOMContentLoaded", function () {
    // تأثير النقر على الصفوف
    const tableRows = document.querySelectorAll("tbody tr");
    tableRows.forEach((row) => {
        row.addEventListener("click", function () {
            // إزالة التحديد من جميع الصفوف
            tableRows.forEach((r) => {
                r.classList.remove("table-active");
                r.querySelectorAll("td").forEach((td) =>
                    td.classList.remove("active")
                );
            });

            // إضافة التحديد للصف الحالي
            this.classList.add("table-active");
            this.querySelectorAll("td").forEach((td) =>
                td.classList.add("active")
            );
        });
    });

    // تأثير البحث في قوائم التصفية
    const searchInputs = document.querySelectorAll(".search-checkbox");
    searchInputs.forEach((input) => {
        input.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const checkboxList = this.closest(
                ".enhanced-filter-menu"
            ).querySelector(".enhanced-checkbox-list");
            const labels = checkboxList.querySelectorAll(
                "label:not(:first-child)"
            );

            labels.forEach((label) => {
                const text = label.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    label.style.display = "flex";
                } else {
                    label.style.display = "none";
                }
            });
        });
    });

    // تأثير "تحديد الكل"
    const allCheckboxes = document.querySelectorAll(
        '.enhanced-checkbox-list input[value="all"]'
    );
    allCheckboxes.forEach((allCheckbox) => {
        allCheckbox.addEventListener("change", function () {
            const checkboxList = this.closest(".enhanced-checkbox-list");
            const otherCheckboxes = checkboxList.querySelectorAll(
                'input[type="checkbox"]:not([value="all"])'
            );

            otherCheckboxes.forEach((checkbox) => {
                checkbox.checked = this.checked;
            });
        });
    });

    // تأثير تطبيق التصفية
    const applyButtons = document.querySelectorAll(".enhanced-apply-btn");
    applyButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // إغلاق القائمة المنسدلة
            const dropdown = this.closest(".dropdown");
            const dropdownToggle = dropdown.querySelector(
                '[data-bs-toggle="dropdown"]'
            );

            // إضافة تأثير بصري للإشارة لتطبيق التصفية
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i>';
                bootstrap.Dropdown.getInstance(dropdownToggle)?.hide();
            }, 500);
        });
    });

    // تأثير الأزرار
    const actionButtons = document.querySelectorAll(".action-btn");
    actionButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.stopPropagation();

            // تأثير النقر
            this.style.transform = "scale(0.95)";
            setTimeout(() => {
                this.style.transform = "";
            }, 150);

            if (this.classList.contains("btn-delete")) {
                if (confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
                    console.log("تم الحذف");
                }
            } else if (this.classList.contains("btn-edit")) {
                console.log("تم النقر على تعديل");
            }
        });
    });

    // تأثير التمرير السلس
    const tableContainer = document.querySelector(".table-container");
    let isScrolling = false;

    tableContainer.addEventListener("scroll", function () {
        if (!isScrolling) {
            window.requestAnimationFrame(function () {
                // يمكن إضافة تأثيرات أثناء التمرير هنا
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
});
