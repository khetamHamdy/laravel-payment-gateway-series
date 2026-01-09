
var currentMonth = lastMonth;
// حقل قرض الجمعية
let association_loan_months_total = 0;
let association_loan_months;
let total_association_loan_new_val;
let total_association_loan = 0;

function association_loan_fields(e){
    total_association_loan = $('#total_association_loan_old').text();

    association_loan_months = $('#association_loan_months').val();
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            $("#association_loan_month-"+i).val(association_loan_months)
        }
    }
    association_loan_months_total = 0;
    for(let i = 1;i <= 12;i++){
        association_loan_months_total = Number(association_loan_months_total) + Number($("#association_loan_month-" + i).val());
    }
    total_association_loan_new_val = Number(total_association_loan) - (association_loan_months_total);
    $("#total_association_loan").val(total_association_loan_new_val);
}
function association_loan_fields_month(e){
    total_association_loan_new_val = 0;
    association_loan_months_total = 0;
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            association_loan_months_total += Number($("#association_loan_month-" + i).val());
        }
    }
    total_association_loan_new_val = Number(total_association_loan) - (association_loan_months_total);
    $("#total_association_loan").val(total_association_loan_new_val);
}

// حقل قرض الإدخار
let savings_loan_months_total = 0;
let savings_loan_months;
let total_savings_loan_new_val;
let total_savings_loan = 0;


function savings_loan_fields(e){
    total_savings_loan = $('#total_savings_loan_old').text();


    savings_loan_months = $('#savings_loan_months').val();
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            $("#savings_loan_month-"+i).val(savings_loan_months)
        }
    }
    savings_loan_months_total = 0;
    for(let i = 1;i <= 12;i++){
        savings_loan_months_total = Number(savings_loan_months_total) + Number($("#savings_loan_month-" + i).val());
    }
    total_savings_loan_new_val = Number(total_savings_loan) - (savings_loan_months_total);
    $("#total_savings_loan").val(total_savings_loan_new_val);
}

function savings_loan_fields_month(e){
    total_savings_loan = $('#total_savings_loan_old').text();

    total_savings_loan_new_val = 0;
    savings_loan_months_total = 0;
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            savings_loan_months_total += Number($("#savings_loan_month-" + i).val());
        }
    }
    total_savings_loan_new_val = Number(total_savings_loan) - (savings_loan_months_total);
    $("#total_savings_loan").val(total_savings_loan_new_val);
}




// حقل قرض اللجنة
let shekel_loan_months_total = 0;
let shekel_loan_months;
let total_shekel_loan_new_val;
let total_shekel_loan = 0;

function shekel_loan_fields(e){
    total_shekel_loan = $('#total_shekel_loan_old').text();

    shekel_loan_months = $('#shekel_loan_months').val();
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            $("#shekel_loan_month-"+i).val(shekel_loan_months)
        }
    }
    shekel_loan_months_total = 0;
    for(let i = 1;i <= 12;i++){
        shekel_loan_months_total = Number(shekel_loan_months_total) + Number($("#shekel_loan_month-" + i).val());
    }
    total_shekel_loan_new_val = Number(total_shekel_loan)  - (shekel_loan_months_total);
    $("#total_shekel_loan").val(total_shekel_loan_new_val);
}

function shekel_loan_fields_month(e){
    total_shekel_loan_new_val = 0;
    shekel_loan_months_total = 0;
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            shekel_loan_months_total += Number($("#shekel_loan_month-" + i).val());
        }
    }
    total_shekel_loan_new_val = Number(total_shekel_loan) - (shekel_loan_months_total);
    $("#total_shekel_loan").val(total_shekel_loan_new_val);
}

function fields_month(e){
    fields_month_new_val = $('.fields_month').val();
    console.log(fields_month_new_val);
    for(let i = 1;i <= 12;i++){
        if(i >= currentMonth){
            $(".fields_month-"+i).val(fields_month_new_val)
        }
    }
}
