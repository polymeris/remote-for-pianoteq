import * as pianoteq from './pianoteq.js'

// We want to load all the states before the DOM finish loading to make the
// page load as fast as possible.
const initial_data_promise = pianoteq.get_display_data();


function set_ui_disabled(ui, disabled) {
  for (let [_, element] of Object.entries(ui)) {
    element.disabled = disabled;
  }
}

function populate_preset_dropdown(ui, data, instrument) {
  // Build the preset drop down.
  ui.select_preset.innerHTML = "";
  for (let preset_name in data.available_presets[instrument]) {
    let option = document.createElement("option");
    option.value = preset_name;
    option.text = preset_name;
    ui.select_preset.appendChild(option);
  }
  ui.select_preset.value = data.preset;
}

function update_ui(ui, data) {
  ui.volume.value = data.volume;
  ui.condition.value = data.condition;
  ui.pedal_noise.value = data.pedal_noise;
  ui.key_release_noise.value = data.key_release_noise;

  // Build the instrument drop down.
  ui.select_instrument.innerHTML = "";
  for (let instrument_name in data.available_presets) {
    let option = document.createElement("option");
    option.value = instrument_name;
    option.text = instrument_name;
    ui.select_instrument.appendChild(option);
  }
  ui.select_instrument.value = data.instrument;

  populate_preset_dropdown(ui, data, data.instrument);

  // Build the output mode dropdown.
  // ui.select_output_mode.value = data.output_mode;

  // Build the reverb dropdown.
  if (!data.reverb) {
    let unknown_reverb_preset = document.getElementById("unknown-reverb-preset");
    if (!unknown_reverb_preset) {
      unknown_reverb_preset = document.createElement("option");
      unknown_reverb_preset.value = "Unknown/Custom";
      unknown_reverb_preset.text = "Unknown/Custom";
      ui.select_reverb.appendChild(unknown_reverb_preset);
      ui.select_reverb.value = unknown_reverb_preset.value;
    }
  } else {
    ui.select_reverb.value = data.reverb;
  }

  // Build the data table
  ui.data_table.innerHTML = "";
  for (let i in data.data_table) {
    let row = data.data_table[i];
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");

    td1.textContent = row[0];
    td2.textContent = row[1];

    tr.appendChild(td1);
    tr.appendChild(td2);

    ui.data_table.appendChild(tr);
  }

  // Find the closest bpm value from the list of options
  // const bpm = Number(data.metronome.bpm);
  // for (const bpm_opt of ui.metronome_bpm.options) {
  //   if (Number(bpm_opt.value) <= bpm) {
  //     ui.metronome_bpm.value = bpm_opt.value;
  //   } else {
  //     break;
  //   }
  // }
  //
  // ui.metronome_signature.value = data.metronome.timesig;
  // ui.metronome_volume.value = data.metronome.volume_db;
  // ui.metronome_accent.checked = data.metronome.accentuate;
  // document.metronomeState = data.metronome.enabled;

  set_ui_disabled(ui, false);
}

async function refresh_and_reenable_ui(ui) {
  const data = await pianoteq.get_display_data();
  update_ui(ui, data);
}

function handle_error(ui, error) {
  ui.flash_message.textContent = `${error}. Please reload the page.`;
  ui.flash_box.style.display = "block";
  ui.flash_hr.style.display = "block";
}

async function main() {
  let ui = {
    volume: document.getElementById("volume"),
    tickmarks: document.getElementById("tickmarks"),

    condition: document.getElementById("condition"),
    tickmarks_cond: document.getElementById("tickmarks_cond"),

    pedal_noise: document.getElementById("pedal-noise"),
    tickmarks_pedal_noise: document.getElementById("tickmarks_pedal_noise"),

    key_release_noise: document.getElementById("key-release-noise"),
    tickmarks_key_release_noise: document.getElementById("tickmarks_key_release_noise"),

    select_instrument: document.getElementById("instrument"),
    select_preset: document.getElementById("preset"),
    // select_output_mode: document.getElementById("output-mode"),
    select_reverb: document.getElementById("reverb"),

    data_table: document.getElementById("data-table"),
    debug_textfield: document.getElementById("debug"),

    flash_box: document.getElementById("flash"),
    flash_message: document.getElementById("flash-message"),
    flash_hr: document.getElementById("flash-hr"),

    // metronome_toggle: document.getElementById("metronome-toggle"),
    // metronome_bpm: document.getElementById("metronome"),
    // metronome_signature: document.getElementById("metronome-signature"),
    // metronome_volume: document.getElementById("metronome-volume"),
    // metronome_accent: document.getElementById("metronome-accent"),
  }

  for (let i = 0; i < 1; i += 0.1) {
      ui.tickmarks.appendChild(new Option('', i));
      ui.tickmarks_cond.appendChild(new Option('', i));
      ui.tickmarks_pedal_noise.appendChild(new Option('', i));
      ui.tickmarks_key_release_noise.appendChild(new Option('', i));
  }

  ui.volume.addEventListener("change", async function() {
    set_ui_disabled(ui, true);
    await pianoteq.set_volume(this.value).then(async(data) => {
      await refresh_and_reenable_ui(ui);
    }).catch((error) => {
      handle_error(ui, error);
    });
  })

  ui.condition.addEventListener("change", async function() {
    set_ui_disabled(ui, true);
    await pianoteq.set_condition(this.value).then(async(data) => {
      await refresh_and_reenable_ui(ui);
    }).catch((error) => {
      handle_error(ui, error);
    });
  })

  ui.pedal_noise.addEventListener("change", async function() {
    set_ui_disabled(ui, true);
    await pianoteq.set_pedal_noise(this.value).then(async(data) => {
      await refresh_and_reenable_ui(ui);
    }).catch((error) => {
      handle_error(ui, error);
    });
  })

  ui.key_release_noise.addEventListener("change", async function() {
    set_ui_disabled(ui, true);
    await pianoteq.set_key_release_noise(this.value).then(async(data) => {
      await refresh_and_reenable_ui(ui);
    }).catch((error) => {
      handle_error(ui, error);
    });
  })

  ui.select_instrument.addEventListener("change",  function() {
    populate_preset_dropdown(ui, pianoteq_data, this.value);
  })

  ui.select_preset.addEventListener("change", async function() {
    set_ui_disabled(ui, true);
    await pianoteq.load_preset(this.value, pianoteq_data.available_presets[ui.select_instrument.value][this.value].bank).then(async(data) => {
      await refresh_and_reenable_ui(ui);
    }).catch((error) => {
      handle_error(ui, error);
    });
  })

  // ui.select_output_mode.addEventListener("change", async function() {
  //   set_ui_disabled(ui, true);
  //   await pianoteq.set_sound_output(this.value).then(async(data) => {
  //     await refresh_and_reenable_ui(ui);
  //   }).catch((error) => {
  //     handle_error(ui, error);
  //   });
  // })

  ui.select_reverb.addEventListener("change", async function() {
    set_ui_disabled(ui, true);
    await pianoteq.set_reverb(this.value).then(async(data) => {
      await refresh_and_reenable_ui(ui);
    }).catch((error) => {
      handle_error(ui, error);
    });
  })

  // Reproduces the list from the PianoTeq tempo menu
  // for (let i = 40; i < 60; i += 4) ui.metronome_bpm.add(new Option(i + ' bpm', i));
  // for (let i = 60; i < 72; i += 3) ui.metronome_bpm.add(new Option(i + ' bpm', i));
  // for (let i = 72; i < 120; i += 4) ui.metronome_bpm.add(new Option(i + ' bpm', i));
  // for (let i = 120; i < 144; i += 6) ui.metronome_bpm.add(new Option(i + ' bpm', i));
  // for (let i = 144; i <= 208; i += 8) ui.metronome_bpm.add(new Option(i + ' bpm', i));
  // ui.metronome_bpm.add(new Option('Other value...', 999));

  // const metronome_update = async function() {
  //   set_ui_disabled(ui, true);
  //   const bpm = Number(
  //     ui.metronome_bpm.value == '999'
  //       ? window.prompt('Enter the new BPM value', '')
  //       : ui.metronome_bpm.value
  //   );
  //   const signature = ui.metronome_signature.value;
  //   const volume = Number(ui.metronome_volume.value);
  //   const accent = ui.metronome_accent.checked;
  //   await pianoteq.config_metronome(bpm, signature, volume, accent).then(async(data) => {
  //     await refresh_and_reenable_ui(ui);
  //   }).catch((error) => {
  //     handle_error(ui, error);
  //   });
  // }
  // ui.metronome_bpm.addEventListener("change", metronome_update);
  // ui.metronome_signature.addEventListener("change", metronome_update);
  // ui.metronome_volume.addEventListener("change", metronome_update);
  // ui.metronome_accent.addEventListener("change", metronome_update);
  //
  // ui.metronome_toggle.addEventListener("click", async function() {
  //   set_ui_disabled(ui, true);
  //   await pianoteq.set_metronome(!document.metronomeState).then(async(data) => {
  //     await refresh_and_reenable_ui(ui);
  //   }).catch((error) => {
  //     handle_error(ui, error);
  //   });
  // });

  // We wait here as we're finally ready to put the data into the various UI.
  const pianoteq_data = await initial_data_promise.then((data) => {
    update_ui(ui, data);
    return data;
  }).catch((error) => {
    handle_error(ui, error);
  });
}

if (document.readyState != "loading") {
  main();
} else {
  document.addEventListener("DOMContentLoaded", main);
}

