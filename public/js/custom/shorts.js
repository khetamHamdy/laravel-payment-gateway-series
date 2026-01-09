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

// Video Files
$(function() {
    function usedQualities() {
        return $('#video-rows .video-quality').map(function() {
            return $(this).val();
        }).get();
    }

    // منع تكرار الجودة
    function enforceUniqueVideoCombo($changed) {
        const seen = {};
        $('#video-rows .video-row').each(function() {
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

        $row.find('.source-toggle').on('change', function() {
            toggleSource($row, $(this).val());
            inferFormatFrom($row);
        });

        $row.find('.video-file').on('change', function() {
            inferFormatFrom($row);
        });

        $row.find('.video-url').on('input', function() {
            inferFormatFrom($row);
        });

        $row.find('.video-quality').on('change', function() {
            enforceUniqueVideoCombo($(this));
        });
        $row.find('.video-type').on('change', function() {
            enforceUniqueVideoCombo($(this));
        });

        // عند إضافة صف جديد: حاول ضبط الجودة لأقرب خيار غير مستخدم
        const used = new Set(usedQualities());
        const $q = $row.find('.video-quality');
        if (!$q.val()) {
          for (const candidate of ['240p', '360p', '480p', '720p', '1080p', '4k']) {
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
    $('#add-video-row').on('click', function() {
        videoIndex++;
        $.get(videoRowPartial, {
            i: videoIndex
        }, function(html) {
            const $newRow = $(html);
            $('#video-rows').append($newRow);
            initVideoRow($newRow);
        });
    });

    // حذف صف الفيديو
    $(document).on('click', '.remove-video-row', function () {
        let row = $(this).closest('.video-row');
        let videoId = row.find('.video-id').val();
        if (videoId) {
           // alert('test')
            // إذا الفيديو موجود مسبقًا في DB → نرسل طلب حذف
            $.ajax({

                url: '/dashboard/video-files/' + videoId,
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


    $(document).on('change', '.source-toggle', function(){
        const $row   = $(this).closest('.video-row');
        const source = $(this).val();
        const $file  = $row.find('.video-file');
        const $url   = $row.find('.video-url');
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
    $('#video-rows .video-row').each(function() {
        initVideoRow($(this));
    });
});
