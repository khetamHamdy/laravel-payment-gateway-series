// Categories
$(function () {
    function refreshSelected() {
        let container = $("#selected-categories div");
        container.empty();

        $("#category-badges input:checked").each(function () {
            let parent = $(this).closest("label");
            let clone = parent.clone(true);

            // أزل أي d-none
            clone
                .removeClass("btn-outline-primary d-none")
                .addClass("btn-primary text-white selected-item");

            // شيل الـ checkbox من النسخة اللي فوق
            clone.find("input").remove();

            container.append(clone);
            parent.addClass("d-none"); // الأصل يختفي من تحت
        });

        if (container.children().length > 0) {
            $("#selected-categories").removeClass("d-none");
        } else {
            $("#selected-categories").addClass("d-none");
        }
    }

    // عند الضغط تحت
    $(document).on("click", "#category-badges label", function () {
        let checkbox = $(this).find("input[type=checkbox]");
        checkbox.prop("checked", true);
        refreshSelected();
    });

    // عند الضغط فوق (يمسح ويرجّع لتحت)
    $(document).on("click", "#selected-categories .selected-item", function () {
        let id = $(this).data("id");
        let original = $('#category-badges label[data-id="' + id + '"]');
        original.find("input").prop("checked", false);
        original.removeClass("d-none");
        refreshSelected();
    });

    // عند تحميل الصفحة
    $(function () {
        refreshSelected();
    });
});

// Cast
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
                data: params => ({
                    term: params.term
                }),
                processResults: data => {
                    // احذف الأشخاص المختارين من النتائج
                    let usedIds = $('#cast-rows .person-select').map(function () {
                        return $(this).val();
                    }).get();

                    return {
                        results: data.filter(p => !usedIds.includes(String(p.id)))
                    };
                }
            },
            templateResult: person => {
                if (!person.id) return person.text;
                let img = person.photo_url ?
                    `<img src="${person.photo_url}" class="rounded-circle me-2" style="width:24px;height:24px;">` :
                    `<img src="/imgs/user.jpg" class="rounded-circle me-2" style="width:24px;height:24px;">`;
                return $(`<span>${img} ${person.text}</span>`);
            },
            templateSelection: person => person.text || person.id,
            escapeMarkup: m => m
        }).on('select2:select', function (e) {
            let selectedId = e.params.data.id;
            let duplicates = $('#cast-rows .person-select').not(this).filter(function () {
                return $(this).val() == selectedId;
            });

            if (duplicates.length > 0) {
                // موجود مسبقاً → امنع التكرار
                $(this).val(null).trigger('change');
                toastr.error(person_duplicate);
            }

            refreshSelected();
        }).on('select2:unselect', function () {
            refreshSelected();
        });
    }
    // init للصفوف الجاهزة عند تحميل الصفحة
    $(function () {
        initPersonSelect(document);
    });
    let castIndex = $('#cast-rows .cast-row').length ? $('#cast-rows .cast-row').length - 1 : 0;

    // إضافة سطر جديد
    $('#add-cast-row').on('click', function () {
        castIndex++;
        $.get(castRowPartial, {
            i: castIndex
        }, function (html) {
            let newRow = $(html);
            $('#cast-rows').append(newRow);
            renumberOrdering();
            refreshSelected();
            initPersonSelect(newRow);
        });
    });

    $('#add-cast-sub-row').on('click', function () {
        castIndex++;
        $.get(subRowPartial, {
            i: castIndex
        }, function (html) {
            let newRow = $(html);
            $('#cast-rows').append(newRow);
            renumberOrdering();
            refreshSelected();
            initPersonSelect(newRow);
        });

    });

    // حذف كاست من قاعدة البيانات أو من الواجهة
    $(document).on('click', '.remove-cast-row', function () {
        let row = $(this).closest('.cast-row');
        let castId = row.find('.cast-id').val();
        // alert(castId)
        if (castId) {
            $.ajax({
                url: '/dashboard/movies-casts/' + castId,
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

    $(document).on('click', '.remove-cast-sub-row', function () {
        let row = $(this).closest('.cast-row');
        let castId = row.find('.cast-id').val();
        //alert(castId)
        if (castId) {
            $.ajax({
                url: '/dashboard/sub-plans-delete/' + castId,
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

    $(document).on('click', '.remove-country-row', function () {
        let row = $(this).closest('.country-row');
        let castId = row.find('.countryPrices-id').val();
        //alert(castId)
        if (castId) {
            $.ajax({
                url: '/dashboard/country-delete/' + castId,
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

    // مسح الشخص من حقل الإدخال
    $(document).on('click', '.person-clear', function () {
        let row = $(this).closest('.cast-row');
        row.find('.person-input').val('');
        row.find('.person-id').val('');
        row.find('.dupe-warning').addClass('d-none');
        refreshSelected();
    });

    // تحليل اختيار الـ datalist => تعبئة person_id
    $(document).on('input', '.person-input', function () {
        let row = $(this).closest('.cast-row');
        let txt = $(this).val().trim();
        let id = txt.includes('#') ? txt.split('#').pop().trim() : '';
        row.find('.person-id').val(id);

        // منع التكرار
        if (id && isDuplicate(id, row)) {
            row.find('.dupe-warning').removeClass('d-none');
            row.find('.person-input').addClass('is-invalid');
        } else {
            row.find('.dupe-warning').addClass('d-none');
            row.find('.person-input').removeClass('is-invalid');
        }
        refreshSelected();
    });

    // تحريك لأعلى/أسفل
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

    // إزالة من المختار (chip) وإرجاعه للسطر المعني
    $(document).on('click', '.chip-remove', function () {
        let id = $(this).closest('.cast-chip').data('id');
        let row = findRowByPersonId(id);
        if (row.length) {
            row.find('.person-input').val('');
            row.find('.person-id').val('');
            row.find('.dupe-warning').addClass('d-none');
            row.find('.person-input').removeClass('is-invalid');
        }
        refreshSelected();
    });

    // ===== Helpers =====

    function renumberOrdering() {
        // في وضع التعديل لا نلمس ترتيب السطور الموجودة
        if (form_type === "edit") {
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



    function isDuplicate(personId, currentRow) {
        let dup = false;
        $('#cast-rows .cast-row').each(function () {
            if (this === currentRow[0]) return;
            const other = $(this).find('.person-id').val();
            if (other && other === personId) {
                dup = true;
                return false;
            }
        });
        return dup;
    }

    function findRowByPersonId(personId) {
        let found = $();
        $('#cast-rows .cast-row').each(function () {
            if ($(this).find('.person-id').val() === personId) {
                found = $(this);
                return false;
            }
        });
        return found;
    }

    // بناء شريط المختارين (chips)
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

    // init
    $(function () {
        renumberOrdering();
        refreshSelected();
    });
});

// Video Files
$(function () {
    function usedQualities() {
        return $('#video-rows .video-quality').map(function () {
            return $(this).val();
        }).get();
    }

    // منع تكرار الجودة
    function enforceUniqueVideoCombo($changed) {
        const seen = {};
        $('#video-rows .video-row').each(function () {
            const $row = $(this);
            const type = $row.find('.video-type').val();
            const quality = $row.find('.video-quality').val();
            // نظف أي تحذيرات قديمة
            $row.find('.combo-dup').remove();
            $row.find('.video-type, .video-quality').removeClass('is-invalid');

            if (!type || !quality) return;

            const key = type + '_' + quality;

            if (seen[key]) {
                $row.find('.video-type, .video-quality').addClass('is-invalid');
                $row.append(
                    '<div class="mt-1 text-danger small combo-dup">❌ هذا النوع مع هذه الجودة مستخدم بالفعل</div>'
                );
                $('#submitBtn').prop('disabled', true);

                if ($changed && $row[0] === $changed.closest('.video-row')[0]) {
                    // أعد تعيين القيمة المختارة
                    $row.find('.video-quality').val('');
                }
            } else {
                seen[key] = true;
                $('#submitBtn').prop('disabled', false);
            }
        });
    }

    // تبديل مصدر الإدخال (ملف/رابط)
    function toggleSource($row, source) {
        const $file = $row.find('.video-file');
        const $url = $row.find('.video-url');
        const $sourceType = $row.find('.source-type');


        source = $sourceType.val() || source;
        if (source == 'file') {
            $file.removeClass('d-none').prop('disabled', false).prop('required', !form_type);
            $url.addClass('d-none').prop('disabled', true).prop('required', false);
        } else {
            $file.addClass('d-none').prop('disabled', true).prop('required', false);
            $url.removeClass('d-none').prop('disabled', false).prop('required', !form_type);
        }
    }

    // استنتاج صيغة الفيديو (format) من الامتداد
    function inferFormatFrom($row) {
        const $file = $row.find('.video-file')[0];
        const $url = $row.find('.video-url');
        let fmt = '';

        if (!$row.find('.video-file').hasClass('d-none') && $file && $file.files && $file.files[0]) {
            const name = $file.files[0].name || '';
            fmt = name.split('.').pop().toLowerCase();
        } else {
            const link = ($url.val() || '').split('?')[0];
            const ext = link.split('.').pop().toLowerCase();
            if (['mp4', 'webm', 'mov', 'mkv', 'm3u8'].includes(ext)) fmt = ext;
        }

        $row.find('.video-format').val(fmt);
    }

    // تهيئة سطر واحد
    function initVideoRow($row) {
        // المصدر الافتراضي: URL
        toggleSource($row, 'url');

        $row.find('.source-toggle').on('change', function () {
            toggleSource($row, $(this).val());
            inferFormatFrom($row);
        });

        $row.find('.video-file').on('change', function () {
            inferFormatFrom($row);
        });

        $row.find('.video-url').on('input', function () {
            inferFormatFrom($row);
        });

        $row.find('.video-quality').on('change', function () {
            enforceUniqueVideoCombo($(this));
        });
        $row.find('.video-type').on('change', function () {
            enforceUniqueVideoCombo($(this));
        });

        // عند إضافة صف جديد: حاول ضبط الجودة لأقرب خيار غير مستخدم
        const used = new Set(usedQualities());
        const $q = $row.find('.video-quality');
        if (!$q.val()) {
            for (const candidate of ['sd', 'hd', 'fhd', 'uhd']) {
                if (!used.has(candidate)) {
                    $q.val(candidate);
                    break;
                }
            }
        }
        enforceUniqueVideoCombo();
    }

    // زر إضافة صف
    let videoIndex = $('#video-rows .video-row').length ? $('#video-rows .video-row').length - 1 : 0;
    $('#add-video-row').on('click', function () {
        videoIndex++;
        $.get(videoRowPartial, {
            i: videoIndex
        }, function (html) {
            const $newRow = $(html);
            $('#video-rows').append($newRow);
            initVideoRow($newRow);
        });
    });

    // حذف صف
    $(document).on('click', '.remove-video-row', function () {
        let row = $(this).closest('.video-row');
        let videoId = row.find('.video-id').val();
        // alert('test')
        if (videoId) {
            //alert('test')
            // إذا الفيديو موجود مسبقًا في DB → نرسل طلب حذف
            $.ajax({
                url: '/dashboard/movies-video-files/' + videoId,
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    if (res.status) {
                        row.remove();
                        enforceUniqueVideoCombo(); // إعادة فحص الجودة بعد الحذف
                    } else {
                        alert(res.message);
                    }
                },
                error: function () {
                    alert('حدث خطأ أثناء الحذف!');
                }
            });
        } else {
            // الفيديو جديد ولم يُحفظ بعد → نحذفه مباشرة من الواجهة
            row.remove();
            enforceUniqueVideoCombo();
        }
    });
    $(document).on('change', '.source-toggle', function () {
        const $row = $(this).closest('.video-row');
        const source = $(this).val();
        const $file = $row.find('.video-file');
        const $url = $row.find('.video-url');
        let $sourceType = $row.find('.source-type');

        if (source === 'file') {
            $file.removeClass('d-none').prop('disabled', false).prop('required', true);
            $url.addClass('d-none').prop('disabled', true).prop('required', false).val('');
            $sourceType.val('file');
        } else {
            $file.addClass('d-none').prop('disabled', true).prop('required', false).val('');
            $url.removeClass('d-none').prop('disabled', false).prop('required', true);
            $sourceType.val('url');
        }
    });



    // init للصفوف الحالية
    $('#video-rows .video-row').each(function () {
        initVideoRow($(this));
    });
});

// Subtitles
$(function () {

    // خريطة لأسماء اللغات لملء label تلقائيًا إن كان فاضي
    const LANG_LABELS = {
        ar: 'العربية',
        en: 'English',
        fr: 'Français',
        es: 'Español',
        de: 'Deutsch',
        it: 'Italiano',
        tr: 'Türkçe',
        fa: 'فارسی',
        ur: 'اردو',
        ru: 'Русский',
        zh: '中文',
        ja: '日本語',
        ko: '한국어'
    };

    function usedLangs() {
        return $('#sub-rows .sub-language').map(function () {
            return ($(this).val() || '').trim().toLowerCase();
        }).get().filter(Boolean);
    }

    function usedLabels() {
        return $('#sub-rows .sub-label').map(function () {
            return ($(this).val() || '').trim();
        }).get().filter(Boolean);
    }

    // منع تكرار اللغة
    function enforceUniqueLanguage() {
        const seen = {};
        $('#sub-rows .sub-row').each(function () {
            const $row = $(this);
            const lang = ($row.find('.sub-language').val() || '').trim().toLowerCase();

            $row.find('.lang-dup').addClass('d-none');
            $row.find('.sub-language').removeClass('is-invalid');

            if (!lang) return;

            if (seen[lang]) {
                $row.find('.sub-language').addClass('is-invalid');
                $row.find('.lang-dup').removeClass('d-none');
            } else {
                seen[lang] = true;
            }
        });
    }

    // منع تكرار label
    function enforceUniqueLabel() {
        const seen = {};
        $('#sub-rows .sub-row').each(function () {
            const $row = $(this);
            const lbl = ($row.find('.sub-label').val() || '').trim();

            $row.find('.label-dup').addClass('d-none');
            $row.find('.sub-label').removeClass('is-invalid');

            if (!lbl) return;

            if (seen[lbl]) {
                $row.find('.sub-label').addClass('is-invalid');
                $row.find('.label-dup').removeClass('d-none');
            } else {
                seen[lbl] = true;
            }
        });
    }

    // واحد فقط افتراضي
    function enforceSingleDefault($changed) {
        if ($changed && $changed.is(':checked')) {
            $('#sub-rows .sub-default').not($changed).prop('checked', false);
        } else {
            // لا شيء محدد؟ مسموح، مش إجباري
        }
    }

    // تبديل مصدر الإدخال (ملف/رابط)
    function toggleSource($row, source) {
        const $file = $row.find('.sub-file');
        const $url = $row.find('.sub-url');
        if (source === 'file') {
            $file.removeClass('d-none').prop('disabled', false).prop('required', !form_type);
            $url.addClass('d-none').prop('disabled', true).prop('required', false);
        } else {
            $file.addClass('d-none').prop('disabled', true).prop('required', false);
            $url.removeClass('d-none').prop('disabled', false).prop('required', !form_type);
        }
    }

    // ملء label تلقائيًا حسب اللغة (لو فاضي)
    function autoFillLabel($row) {
        const lang = ($row.find('.sub-language').val() || '').trim().toLowerCase();
        const $label = $row.find('.sub-label');
        if (!$label.val()) {
            if (LANG_LABELS[lang]) {
                $label.val(LANG_LABELS[lang]);
            } else if (lang) {
                $label.val(lang.toUpperCase());
            }
        }
    }

    function initSubRow($row) {
        // مصدر افتراضي: URL
        toggleSource($row, 'url');

        $row.find('.sub-source').on('change', function () {
            toggleSource($row, $(this).val());
        });

        $row.find('.sub-language').on('input', function () {
            autoFillLabel($row);
            enforceUniqueLanguage();
        });

        $row.find('.sub-label').on('input', function () {
            enforceUniqueLabel();
        });

        $row.find('.sub-default').on('change', function () {
            enforceSingleDefault($(this));
        });

        // تشغيل التحققات أوليًّا
        autoFillLabel($row);
        enforceUniqueLanguage();
        enforceUniqueLabel();
    }

    // إضافة صف جديد
    let subIndex = $('#sub-rows .sub-row').length ? $('#sub-rows .sub-row').length - 1 : 0;

    $('#add-sub-row').on('click', function () {
        subIndex++;
        $.get(subtitleRowPartial, {
            i: subIndex
        }, function (html) {
            const $newRow = $(html);
            $('#sub-rows').append($newRow);
            initSubRow($newRow);
        });
    });


    // حذف ترجمة من قاعدة البيانات أو من الواجهة
    $(document).on('click', '.remove-sub-row', function () {
        let row = $(this).closest('.sub-row');
        let subId = row.find('.sub-id').val();
        if (subId) {
            $.ajax({
                url: '/dashboard/movies-subtitles/' + subId,
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    if (res.status) {
                        row.remove();
                        enforceUniqueLanguage();
                        enforceUniqueLabel();
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
            enforceUniqueLanguage();
            enforceUniqueLabel();
        }
    });


    // init للصفوف الموجودة
    $('#sub-rows .sub-row').each(function () {
        initSubRow($(this));
    });

});
