$(document).ready(function () {
    loadMedia();
    // رفع صورة
    $("#uploadBtn").click(function () {
        $("#imageInput").click();
    });
    $("#imageInput").change(function () {
        $("#uploadForm").submit();
    });
    // رفع صور (واحدة أو أكثر)
    $("#uploadForm").submit(function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: urlUpload,
            method: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function () {
                $("#imageInput").val(""); // فضّي الاختيار
                loadMedia(); // حدّث المعرض
            },
            error: function (xhr) {
                console.error(xhr.responseJSON || xhr.responseText);
                alert("حدث خطأ أثناء الرفع.");
            },
        });
    });

    // جلب الصور
    function loadMedia() {
        $.get(urlIndex, function (data) {
            let html = "";
            data.forEach((item) => {
                html += `
                    <div class="overflow-hidden masonry-item position-relative">
                        <img src="/storage/${item.file_path}" class="img-fluid media-image">
                        <div class="top-0 p-2 media-actions position-absolute" style="display: none;">
                            <button class="border btn btn-sm btn-light rounded-circle edit-btn" data-id="${item.id}" data-name="${item.name}" title="تعديل">
                                <i class="fas fa-pen text-secondary"></i>
                            </button>
                            <button class="border btn btn-sm btn-light rounded-circle me-1 delete-btn" data-id="${item.id}" title="حذف">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </div>
                        <div class="p-2 text-center info">
                            <small>${item.name}</small>
                        </div>
                    </div>
                `;
            });
            $("#mediaGrid").html(html);
        });
    }

    let deleteId = null;

    $(document).on("click", ".delete-btn", function () {
        deleteId = $(this).data("id");

        // افتح المودال بضغط الزر
        $("#openDeleteModalBtn").click();
    });

    $("#confirmDeleteBtn").click(function () {
        if (deleteId) {
            $.ajax({
                url: urlDelete.replace(":id", deleteId),
                method: "DELETE",
                data: {
                    _token: _token,
                },
                success: function () {
                    $("#closeDeleteModal").click();
                    loadMedia();
                },
            });
        }
    });

    // فتح مودال تعديل
    $(document).on("click", ".edit-btn", function () {
        const id = $(this).data("id");

        $.get(urlEdit.replace(":id", id), function (data) {
            $("#editId").val(data.id);
            $("#infoName").text(data.name);
            $("#infoMime").text(data.mime_type);
            $("#infoSize").text((data.size / 1024).toFixed(2));
            $("#infoURL").val("/storage/" + data.file_path);

            $("#editPreview")
                .attr("src", "/storage/" + data.file_path)
                .attr("alt", data.alt || "");
            $("#editAlt").val(data.alt || "");
            $("#editTitle").val(data.title || "");
            $("#editCaption").val(data.caption || "");
            $("#editDescription").val(data.description || "");
            // فتح المودال باستخدام الزر السري
            document.getElementById("openEditModalBtn").click();
        });
    });

    // تنفيذ التعديل
    $("#editForm").submit(function (e) {
        e.preventDefault();
        const id = $("#editId").val();
        $.ajax({
            url: urlEdit.replace(":id", id),
            method: "PUT",
            data: {
                _token: _token,
                alt: $("#editAlt").val(),
                title: $("#editTitle").val(),
                caption: $("#editCaption").val(),
                description: $("#editDescription").val(),
            },
            success: function () {
                // $('#editModal').modal('hide');
                $("#closeEditModal").click();
                loadMedia();
            },
        });
    });
});
