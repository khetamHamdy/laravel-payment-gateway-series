// =====================
// Categories (Series)
// =====================
$(function () {
    function refreshSelected() {
        let container = $("#selected-categories div");
        container.empty();

        $("#category-badges input:checked").each(function () {
            let parent = $(this).closest("label");
            let clone = parent.clone(true);

            clone
                .removeClass("btn-outline-primary d-none")
                .addClass("btn-primary text-white selected-item");

            clone.find("input").remove();

            container.append(clone);
            parent.addClass("d-none");
        });

        $("#selected-categories").toggleClass("d-none", container.children().length === 0);
    }

    // click under -> select & move up
    $(document).on("click", "#category-badges label", function () {
        let checkbox = $(this).find("input[type=checkbox]");
        checkbox.prop("checked", true);
        refreshSelected();
    });

    // click chip -> unselect & move back down
    $(document).on("click", "#selected-categories .selected-item", function () {
        let id = $(this).data("id");
        let original = $('#category-badges label[data-id="' + id + '"]');
        original.find("input").prop("checked", false);
        original.removeClass("d-none");
        refreshSelected();
    });

    // initial
    $(function () { refreshSelected(); });
});


// =====================
// Cast (Series)
// =====================
$(function () {

    function initPersonSelect(context) {
        $(context).find('.person-select').select2({
            placeholder: function () {
                return $(this).data('placeholder') || "اكتب للبحث...";
            },
            allowClear: true,
            ajax: {
                url: urlPeopleSearch,
                dataType: 'json',
                delay: 250,
                data: params => ({ term: params.term }),
                processResults: data => {
                    // امنع اختيار نفس الشخص مرتين
                    let usedIds = $('#cast-rows .person-select').map(function () {
                        return $(this).val();
                    }).get();
                    return { results: data.filter(p => !usedIds.includes(String(p.id))) };
                }
            },
            templateResult: person => {
                if (!person.id) return person.text;
                let img = person.photo_url
                    ? `<img src="${person.photo_url}" class="rounded-circle me-2" style="width:24px;height:24px;">`
                    : `<img src="/imgs/user.jpg" class="rounded-circle me-2" style="width:24px;height:24px;">`;
                return $(`<span>${img} ${person.text}</span>`);
            },
            templateSelection: person => person.text || person.id,
            escapeMarkup: m => m
        })
            .on('select2:select', function (e) {
                let selectedId = e.params.data.id;
                let duplicates = $('#cast-rows .person-select').not(this).filter(function () {
                    return $(this).val() == selectedId;
                });

                if (duplicates.length > 0) {
                    $(this).val(null).trigger('change');
                    if (typeof toastr !== 'undefined') toastr.error(person_duplicate);
                }
                refreshSelected();
            })
            .on('select2:unselect', function () {
                refreshSelected();
            });
    }

    // chips of selected cast
    function refreshSelected() {
        const wrap = $('#cast-selected > div');
        wrap.empty();

        let any = false;
        $('#cast-rows .person-select').each(function () {
            const pid = $(this).val();
            const name = $(this).find('option:selected').text().trim();
            if (pid && name) {
                any = true;
                wrap.append(
                    `<span class="cast-chip" data-id="${pid}">
                        ${name}
                        <span class="chip-remove" title="إزالة">×</span>
                    </span>`
                );
            }
        });

        $('#cast-selected').toggleClass('d-none', !any);
    }

    function renumberOrdering() {
        // في وضع التعديل لا نلمس ترتيب السطور الموجودة
        if (form_type_ser === "edit") {
            return;
        }

        // في وضع الإضافة فقط نعمل إعادة ترقيم
        $('#cast-rows .cast-row').each(function (index) {
            let id = $(this).find('.cast-id').val();

            // للحفاظ على السطور من DB → فقط السطور الجديدة تُرقّم
            if (!id || id === "" || id === null) {
                $(this).find('input[name*="[sort_order]"]').val(index);
            }
        });
    }

    // init existing rows
    $(function () { initPersonSelect(document); });
    let castIndex = $('#cast-rows .cast-row').length ? $('#cast-rows .cast-row').length - 1 : 0;

    // add row
    $('#add-cast-row').on('click', function () {
        castIndex++;
        $.get(seriesCastRowPartial, { i: castIndex }, function (html) {
            let newRow = $(html);
            $('#cast-rows').append(newRow);
            renumberOrdering();
            refreshSelected();
            initPersonSelect(newRow);
        });
    });

    // remove row
    // حذف كاست من قاعدة البيانات أو من الواجهة
    $(document).on('click', '.remove-cast-row', function () {
        let row = $(this).closest('.cast-row');
        let castId = row.find('.cast-id').val();
       // alert(castId)
        if (castId) {
            $.ajax({
                url: '/dashboard/series-casts/' + castId,
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    if (res.status) {
                        row.remove();
                        renumberOrdering();
                        refreshSelected();
                    } else {
                        alert(res.message);
                    }
                },
                error: function () {
                    alert('حدث خطأ أثناء الحذف!');
                }
            });
        } else {
            row.remove();
            renumberOrdering();
            refreshSelected();
        }
    });

    // move up/down
    $(document).on('click', '.move-up', function () {
        let row = $(this).closest('.cast-row');
        row.prev('.cast-row').before(row);
        renumberOrdering();
    });
    $(document).on('click', '.move-down', function () {
        let row = $(this).closest('.cast-row');
        row.next('.cast-row').after(row);
        renumberOrdering();
    });

    // remove from chips
    $(document).on('click', '.chip-remove', function () {
        let id = $(this).closest('.cast-chip').data('id');
        // فضيّ select2 تبع نفس الشخص
        $('#cast-rows .person-select').each(function () {
            if ($(this).val() == id) {
                $(this).val(null).trigger('change');
            }
        });
        refreshSelected();
    });

    // initial run
    $(function () {
        renumberOrdering();
        refreshSelected();
    });
});
