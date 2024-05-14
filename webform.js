frappe.ready(async function() {
    frappe.web_form.fields_dict.addresses.df.fields[2].fieldtype = "Select";

    let element = document.querySelector('[data-fieldname="addresses"]');
    element.addEventListener('change', async function () {
        let r = frappe.web_form.get_field('addresses').grid;
        let length = r.data.length;
        let rows = frappe.web_form.get_field('addresses').grid.grid_rows_by_docname;

        for (let i = 1; i <= length; i++) {
            let r1 = "row " + i;
            let oldValue = rows[r1].doc.state;
            let stateChanged = false;

            // Listen for state change
            element.addEventListener('stateChanged', function() {
                stateChanged = true;
            });

            // Wait for state change or timeout
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (stateChanged || rows[r1].doc.state !== oldValue) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });

            // Get the updated state value
            let currentState = rows[r1].doc.state;

            console.log(currentState);

            // Now the state is available, proceed with API call
            const getFilterdegreeOptions = () => {
                return new Promise((resolve, reject) => {
                    frappe.call({
                        method: "api_path",
                        args: {
                            state: currentState, // Use the updated state value
                        },
                        callback: (res) => {
                            if (res.message) {
                                console.log(res.message);
                                let city_options = res.message.join('\n');
                                rows[r1].docfields[2].options = city_options;
                                rows[r1].refresh();
                                resolve();
                            } else {
                                reject(new Error("Frappe call failed"));
                            }
                        },
                    });
                });
            };

            try {
                await getFilterdegreeOptions();
            } catch (error) {
                console.error(error);
            }
        }
    });
});
