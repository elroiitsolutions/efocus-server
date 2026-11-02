/**
 * Product image matcher utility for eFocus backend.
 * Accurately matches products with authentic image assets in public/images/products/.
 */

const SMT_PRODUCT_IMAGES = {
  "QUICK-203H": "/images/products/smt/quick-203h-station.webp",
  "WELLER-WT1010": "/images/products/smt/weller-wt1010-station.webp",
  "QUICK-200-K": "/images/products/smt/quick-200-k-type.jpg",
  "QUICK-200-2.4D": "/images/products/smt/quick-200-2-4d-chisel.jpg",
  "QUICK-200-3.2D": "/images/products/smt/quick-200-3-2d-chisel.jpg",
  "WELLER-FT910": "/images/products/smt/weller-ft910.jpg",
  "EDSYN-SWS": "/images/products/smt/edsyn-solder-wire.webp",
  "BLUE-UV-INK": "/images/products/smt/blue-uv-ink.jpg",
  "HAKKO-FG100": "/images/products/smt/hakko-fg100.webp",
  "GS100": "/images/products/smt/gs100-desoldering.webp",
  "QUICK-203H-HE": "/images/products/smt/quick-203h-heating-element.png",
  "DENON-RD500V": "/images/products/smt/denon-rd500v.jpg",
  "HBRS-500": "/images/products/smt/hbrs-500sv-bga-rework-station-mkii.jpg",
  "SEGGER-JLINK": "/images/products/smt/segger-jlink.png",
  "XDS220-ISO": "/images/products/smt/xds220-iso.jpg",
  "ONTAP-FS9165": "/images/products/smt/ontap-fs9165.png",
  "BH-ADP-14E-TI": "/images/products/smt/jtag-adp-14e-ti.webp",
  "BH-ADP-60E-MIPI": "/images/products/smt/jtag-adp-60e-mipi.webp",
  "NI-784662-01": "/images/products/smt/ni-784662-01.jpg",
  "POGO-SPRING": "/images/products/smt/pogo-spring.jpg",
  "RPI-CM4": "/images/products/smt/rpi-cm4.webp",
  "ARDUINO-UNO": "/images/products/smt/arduino-uno.webp",
  "NVIDIA-JETSON": "/images/products/smt/nvidia-jetson.avif",
  "SMT-001": "/images/products/smt/quick-203h-station.webp",
};

const TESTING_PRODUCT_IMAGES = {
  "FLUKE-107": "/images/products/testing/fluke-107.webp",
  "FLUKE-1587FC": "/images/products/testing/fluke-1587fc.webp",
  "FLUKE-15B-PLUS": "/images/products/testing/fluke-15b-plus.webp",
  "FLUKE-1775": "/images/products/testing/fluke-1775.webp",
  "FLUKE-179": "/images/products/testing/fluke-179.webp",
  "FLUKE-17B-PLUS": "/images/products/testing/fluke-17b-plus.webp",
  "FLUKE-190-104": "/images/products/testing/fluke-190-104-iii.webp",
  "FLUKE-TL75": "/images/products/testing/fluke-tl75.webp",
  "GW-LCR-6300": "/images/products/testing/gw-instek-lcr-6300.webp",
  "RIGOL-DSG3065B": "/images/products/testing/rigol-dsg3065b-iq.webp",
  "RIGOL-RSA5065": "/images/products/testing/rigol-rsa5065-tg.jpg",
  "FLIR-E8-PRO": "/images/products/testing/flir-e8-pro.jpg",
  "FLUKE-TIS75": "/images/products/testing/fluke-tis75-plus.webp",
  "HYGROMETER-HT5D": "/images/products/testing/hygrometer-ht-5d.png",
  "PARTICLE-PLUS-8503": "/images/products/testing/particle-plus-8503.jpg",
  "RADEYE-G20": "/images/products/testing/radeye-g20.jpg",
  "EASYLOG-USB-TEMP": "/images/products/testing/easylog-usb-temp.jpg",
  "LX-100-HD4K": "/images/products/testing/lx-100-hd4k-digital-microscope-measurement-system.jpg",
  "MECHANIC-D75T": "/images/products/testing/mechanic-d75t-trinocular-stereo-microscope.webp",
  "PROCESS-CALIBRATOR": "/images/products/testing/process-signal-calibrator.jpg",
  "RIDGID-CA350": "/images/products/testing/ridgid-ca-350-inspection-camera.jpg",
  "RIDGID-SR20": "/images/products/testing/ridgid-sr-20.webp",
  "VERNIER-CALIPER-150MM": "/images/products/testing/digital-vernier-caliper-0-150mm.jpg",
  "VERNIER-CALIPER-300MM": "/images/products/testing/digital-vernier-caliper-0-300mm.webp",
  "DWYER-2002": "/images/products/testing/dwyer-2002-magnehelic-differential-pressure-gauge.webp",
  "FEELER-GAUGE-METAL": "/images/products/testing/feeler-gauge-metal-blade-set.webp",
  "MITUTOYO-293-240": "/images/products/testing/mitutoyo-293-240-digital-micrometer-with-base.webp",
  "PIN-GAUGE-SET": "/images/products/testing/pin-gauge-set-standard.webp",
  "PLASTIC-FEELER-GAUGE": "/images/products/testing/plastic-feeler-gauge.webp",
  "SG-TRIAXIAL": "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms.jpg",
  "FR-1A12L50W05MS": "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms.jpg",
};

const IT_HARDWARE_PRODUCT_IMAGES = {
  "ADATA-512GB-SSD": "/images/products/it_hardware/adata-512gb-ssd.webp",
  "DELL-MONITOR-24": "/images/products/it_hardware/dell-monitor-24.webp",
  "DELL-KEYBOARD": "/images/products/it_hardware/dell-keyboard.webp",
  "DELL-MOUSE": "/images/products/it_hardware/dell-mouse.png",
  "INTEL-AX210": "/images/products/it_hardware/intel-ax210.jpg",
  "LENOVO-P340": "/images/products/it_hardware/lenovo-thinkstation-p340.webp",
  "USB-HUB-2X4": "/images/products/it_hardware/programmable-usb-hub.jpg",
  "SAMSUNG-870-EVO": "/images/products/it_hardware/samsung-870-evo-1tb.webp",
  "PCB-STAND-LARGE": "/images/products/it_hardware/pcb-stand-large.webp",
  "PCB-STAND-SMALL": "/images/products/it_hardware/pcb-stand-small.webp",
  "PEGBOARD-HOOKS": "/images/products/it_hardware/pegboard-tool-board.webp",
  "SOLDER-RACK-2TIER": "/images/products/it_hardware/solder-reel-rack-2tier.webp",
  "SOLDER-RACK-4TIER": "/images/products/it_hardware/solder-reel-rack-4tier.jpg",
  "PCB-RACK-6": "/images/products/it_hardware/pcb-storage-rack-6-slot.jpg",
};

const LABELLING_PRODUCT_IMAGES = {
  "DESKTOP-LABEL-PRINTER": "/images/products/labelling/desktop-label-printer.jpg",
  "HONEYWELL-1950": "/images/products/labelling/honeywell-xenon-1950.webp",
  "INDUSTRIAL-LABEL-PRINTER": "/images/products/labelling/industrial-label-printer.webp",
  "WEBSCAN-OPTIMA": "/images/products/labelling/webscan-trucheck-optima.webp",
  "BARCODE-LABELS-100X50": "/images/products/labelling/barcode-labels-roll-100x50.webp",
  "CALIBRATION-STICKERS": "/images/products/labelling/calibration-due-stickers.webp",
  "FIFO-LABELS-ROLL": "/images/products/labelling/fifo-labels-roll.jpg",
  "METAL-ASSET-TAGS": "/images/products/labelling/metal-asset-tags.webp",
  "QC-APPROVED-LABELS": "/images/products/labelling/qc-approved-labels.avif",
  "QC-REJECTED-LABELS": "/images/products/labelling/qc-rejected-labels.jpg",
  "RESIN-RIBBON-110MM": "/images/products/labelling/resin-thermal-ribbon-110mm.webp",
  "RFID-UHF-LABELS": "/images/products/labelling/rfid-uhf-labels-roll.webp",
  "WAX-RIBBON-110MM": "/images/products/labelling/wax-thermal-ribbon-110mm.webp",
  "RFID-POE-READER": "/images/products/labelling/rfid-poe-reader-ipj-a2010.jpg",
};

const CABLES_PRODUCT_IMAGES = {
  "FIBER-OM3-LC-5M": "/images/products/cables/fiber-patch-cable-om3-lc-5m.jpg",
  "FIBER-OM3-LC-3.5M": "/images/products/cables/fiber-patch-cable-om3-lc-lc-3-5m.jpg",
  "MPO-OM4-20CM": "/images/products/cables/mpo-fiber-cable-om4-20cm.webp",
  "MPO-TRUNK-OM4-12F-50CM": "/images/products/cables/mpo-trunk-om4-12-fiber-50cm.webp",
  "OM5-LC-LC-20CM": "/images/products/cables/om5-lc-lc-fiber-patch-cord-20cm.webp",
  "SM-LC-LC-PATCH-CORD": "/images/products/cables/single-mode-lc-lc-fiber-patch-cord.webp",
  "LAN-CAT6-0.5M": "/images/products/cables/lan-cable-cat6-0-5m.jpg",
  "CAT6-0.5M": "/images/products/cables/lan-cable-cat6-0-5m.jpg",
  "LAN-CAT6-1M": "/images/products/cables/lan-cable-cat6-1m.webp",
  "CAT6-1M": "/images/products/cables/lan-cable-cat6-1m.webp",
  "LAN-CAT6-1.5M": "/images/products/cables/lan-cable-cat6-1-5m.webp",
  "CAT6-1.5M": "/images/products/cables/lan-cable-cat6-1-5m.webp",
  "LAN-CAT6-2M": "/images/products/cables/lan-cable-cat6-2m.webp",
  "CAT6-2M": "/images/products/cables/lan-cable-cat6-2m.webp",
  "POE-INJECTOR-8023AF": "/images/products/cables/poe-injector-fast-ethernet-802-3af.jpg",
  "POE-INJ-FE": "/images/products/cables/poe-injector-fast-ethernet-802-3af.jpg",
  "POE-TESTER-24": "/images/products/cables/poe5-24-port-ieee-802-3bt-100w-tester.jpg",
  "QSFP-40G-SR4-AOC": "/images/products/cables/qsfp-40g-sr4-aoc-module.jpg",
  "QSFP-40G-SR4": "/images/products/cables/qsfp-40g-sr4-aoc-module.jpg",
  "SFP-1G-BASE-SX": "/images/products/cables/sfp-1g-base-sx-transceiver.jpg",
  "SFP-1G-SX": "/images/products/cables/sfp-1g-base-sx-transceiver.jpg",
  "SFP-10G-SR": "/images/products/cables/sfp-10g-base-sr-transceiver.webp",
  "SFP-10G-BASE-SR": "/images/products/cables/sfp-10g-base-sr-transceiver.webp",
  "SFP-PLUS-10G-BASE-SR": "/images/products/cables/sfp-10g-base-sr-transceiver.webp",
  "SFP28-25G-SR": "/images/products/cables/sfp28-25g-sr-transceiver.webp",
  "SFP-25G-SR": "/images/products/cables/sfp28-25g-sr-transceiver.webp",
  "TL-SG108ETP": "/images/products/cables/tp-link-tl-sg108etp-8-port-gigabit-poe-switch.jpg",
  "TL-SG116ETP": "/images/products/cables/tp-link-tl-sg116etp-16-port-gigabit-poe-switch.jpg",
  "TP-LINK-UE300": "/images/products/cables/tp-link-ue300-usb-3-0-to-rj45-adapter.webp",
  "TP-UE300": "/images/products/cables/tp-link-ue300-usb-3-0-to-rj45-adapter.webp",
  "HDMI-CABLE-2M": "/images/products/cables/hdmi-cable-2m.jpg",
  "NI-GPIB-USB-HS": "/images/products/cables/ni-gpib-usb-hs-interface-adapter.webp",
  "USB3-A-TO-C-2M": "/images/products/cables/usb-3-0-type-a-to-type-c-cable-2m.webp",
  "USB-PRINTER-A-TO-B-1.5M": "/images/products/cables/usb-printer-cable-a-to-b-1-5m.webp",
  "USB-TO-RS232-CONV": "/images/products/cables/usb-to-rs232-converter.jpg",
  "USB-TO-RS422-RS485-ADAPTER": "/images/products/cables/usb-to-rs422-rs485-serial-adapter.jpg",
  "RF-ATT-30DB-250W-6GHZ": "/images/products/cables/30db-250w-6ghz-rf-attenuator.jpg",
  "RF-ATT-6DB-2W-6GHZ": "/images/products/cables/6db-6ghz-2w-rf-attenuator.jpg",
  "BELDEN-7807A-RG58": "/images/products/cables/belden-7807a-rg58-coaxial-cable.png",
  "ECT-RF-PROBE-818022025": "/images/products/cables/ect-rf-probe-p-n-818022025.jpg",
  "ECT-RF-PROBE-818033486": "/images/products/cables/ect-rf-probe-p-n-818033486.jpg",
  "ECT-RF-PROBE-818040823": "/images/products/cables/ect-rf-probe-p-n-818040823.jpg",
  "ECT-RF-PROBE-818045873": "/images/products/cables/ect-rf-probe-p-n-818045873.jpg",
  "GPS-GEN-ANTENNA-SET": "/images/products/cables/gps-generator-and-gps-antenna-set.jpg",
  "SMA-SMA-RF-1.6M-LK200": "/images/products/cables/sma-to-sma-rf-cable-1-6m-lk200.webp",
};

const TOOLS_PRODUCT_IMAGES = {
  "COPPER-FOIL-TAPE": "/images/products/tools/copper-foil-tape.webp",
  "AUTO-WIRE-STRIPPER": "/images/products/tools/automatic-wire-stripper.webp",
  "CABLE-TIES-BLACK-300MM": "/images/products/tools/cable-ties-black-300mm.webp",
  "CABLE-TIES-WHITE-200MM": "/images/products/tools/cable-ties-white-200mm.webp",
  "DIGITAL-TORQUE-SCREWDRIVER": "/images/products/tools/digital-torque-screwdriver.webp",
  "FERRULES-0-5MM-RED": "/images/products/tools/ferrules-0-5mm-red.webp",
  "FERRULES-1-5MM-BLACK": "/images/products/tools/ferrules-1-5mm-black.webp",
  "HEAT-SHRINK-ASSORTED-BLACK": "/images/products/tools/heat-shrink-tube-assorted-black.jpg",
  "PNEUMATIC-SCREWDRIVER": "/images/products/tools/pneumatic-screwdriver.webp",
  "PRECISION-SCREWDRIVER-SET": "/images/products/tools/precision-screwdriver-set.jpg",
  "PVC-INSULATION-TAPE": "/images/products/tools/pvc-insulation-tape.webp",
  "RATCHET-CRIMPING-TOOL-FERRULES": "/images/products/tools/ratchet-crimping-tool-for-ferrules.webp",
};

const POWER_PRODUCT_IMAGES = {
  "AMETEK-BLOWER-FAN": "/images/products/power/ametek-blower-fan.png",
  "CHROMA-62012P-40-120": "/images/products/power/chroma-62012p-40-120-dc-power-supply.jpg",
  "EFOCUS-EPS-2030": "/images/products/power/efocus-eps-2030-programmable-dc-power-supply.jpg",
  "EFOCUS-EWS-100-60": "/images/products/power/efocus-ews-100-60-power-supply.webp",
  "EPCOS-10-KVAR-REACTOR": "/images/products/power/epcos-10-kvar-reactor.webp",
  "RELAY-SPDT-6A-24V": "/images/products/power/general-purpose-relay-spdt-6a-24v.webp",
  "ICE-CUBE-RELAY-SPDT-24V": "/images/products/power/ice-cube-relay-spdt-24v-dc.webp",
  "MEANWELL-LRS-200-24": "/images/products/power/meanwell-lrs-200-24-smps-24v.jpg",
  "PULS-ML15-051": "/images/products/power/puls-ml15-051-power-supply-5v.webp",
  "SIEMENS-MCB-10A": "/images/products/power/siemens-circuit-breaker-10a.webp",
  "AIRTAC-4V110-06": "/images/products/power/airtac-4v110-06-solenoid-valve.webp",
  "AIRTAC-TN20X100S": "/images/products/power/airtac-tn20x100s-pneumatic-cylinder.webp",
  "AR4-PNEUMATIC-GRIPPER-KIT": "/images/products/power/ar4-pneumatic-gripper-parts-kit.jpg",
  "FAIRCHILD-10232": "/images/products/power/fairchild-10232-precision-pressure-regulator.webp",
  "SMC-SY7120-5LOZ-N11T": "/images/products/power/smc-sy7120-5loz-n11t-solenoid-valve.webp",
};

const ESD_PRODUCT_IMAGES = {
  "INSULATING-MAT-1MX1M": "/images/products/esd/electrical-insulating-mat-1m-x-1m.webp",
  "ESD-COAT-LARGE": "/images/products/esd/esd-coat-large.webp",
  "ESD-FINGER-COTS-SMALL": "/images/products/esd/esd-finger-cots-small.jpg",
  "ESD-HEEL-GROUNDERS-PAIR": "/images/products/esd/esd-heel-grounders-pair.webp",
  "ESD-SAFE-GLOVES-MEDIUM": "/images/products/esd/esd-safe-gloves-medium.webp",
  "ESD-SHIELDING-BAG-4X6": "/images/products/esd/esd-shielding-bag-4x6.jpg",
  "ESD-WRIST-STRAP-COIL-CORD": "/images/products/esd/esd-wrist-strap-with-coil-cord.webp",
  "MOISTURE-BARRIER-BAG-4X6": "/images/products/esd/moisture-barrier-bag-mbb-4x6.jpg",
  "WIRELESS-ESD-WRIST-STRAP": "/images/products/esd/wireless-esd-wrist-strap.webp",
  "FMX-004-FIELD-METER": "/images/products/esd/fmx-004-handheld-electrostatic-field-meter.jpg",
  "PROSTAT-PRS-801RM": "/images/products/esd/prostat-prs-801rm-surface-resistance-system.png",
  "TESCOM-TC-93060A": "/images/products/esd/tescom-tc-93060a-antenna-coupler.jpg",
  "TESCOM-TC5970D": "/images/products/esd/tescom-tc5970d-shield-box.jpg",
  "TOJOIN-SD6058-C": "/images/products/esd/tojoin-sd6058-c-rf-shield-box.jpg",
  "TREK-152-1-CE": "/images/products/esd/trek-152-1-ce-esd-test-kit.jpg",
  "TREK-520-1-CE": "/images/products/esd/trek-520-1-ce-electrostatic-fieldmeter.jpg",
  "TREK-523-1": "/images/products/esd/trek-523-1-electrostatic-voltmeter.jpg",
};

const EXISTING_IMAGES = {
  cables: "/images/cat_cables_1785994179162.png",
  test: "/images/test.png",
  rf: "/images/cat_rf_1785994214462.png",
  tools: "/images/cat_tools_1785994233090.png",
  net: "/images/bento_net_1785994371883.png",
  smt: "/images/products/smt/quick-203h-station.webp",
  custom: "/images/custom_harness_main_1785994250993.png",
  power: "/images/hero_industrial_cables_1785994163114.png",
};

const PRODUCT_GALLERY_IMAGES = {
  "SG-TRIAXIAL": [
    "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms.jpg",
    "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms-2.jpg",
    "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms-3.jpg",
  ],
  "FR-1A12L50W05MS": [
    "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms.jpg",
    "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms-2.jpg",
    "/images/products/testing/tri-axial-strain-gauge-wire-fr-1a12l50w05ms-3.jpg",
  ],
};

function getSmtProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase();
  const cat = (product.category_name || "").toLowerCase();
  const subcat = (product.subcategory_name || "").toLowerCase();
  const fam = (product.family_name || "").toLowerCase();

  if (sku && SMT_PRODUCT_IMAGES[sku]) return SMT_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(SMT_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("arduino") || name.includes("uno dev board")) return SMT_PRODUCT_IMAGES["ARDUINO-UNO"];
  if (name.includes("jetson") || name.includes("nvidia")) return SMT_PRODUCT_IMAGES["NVIDIA-JETSON"];
  if (name.includes("compute module") || name.includes("rpi-cm4") || name.includes("cm4") || (name.includes("raspberry") && name.includes("module"))) return SMT_PRODUCT_IMAGES["RPI-CM4"];
  if (name.includes("hbrs") || sku.includes("HBRS")) return SMT_PRODUCT_IMAGES["HBRS-500"];
  if (name.includes("denon") || name.includes("rd-500") || name.includes("rd500") || name.includes("bga rework")) return SMT_PRODUCT_IMAGES["DENON-RD500V"];
  if (name.includes("weller wt") || name.includes("wt1010")) return SMT_PRODUCT_IMAGES["WELLER-WT1010"];
  if (name.includes("weller") && (name.includes("tip") || name.includes("ft910"))) return SMT_PRODUCT_IMAGES["WELLER-FT910"];
  if (name.includes("heating element")) return SMT_PRODUCT_IMAGES["QUICK-203H-HE"];
  if (name.includes("2.4d") || name.includes("chisel 2.4")) return SMT_PRODUCT_IMAGES["QUICK-200-2.4D"];
  if (name.includes("3.2d") || name.includes("chisel 3.2")) return SMT_PRODUCT_IMAGES["QUICK-200-3.2D"];
  if (name.includes("k type") || name.includes("200-k")) return SMT_PRODUCT_IMAGES["QUICK-200-K"];
  if (name.includes("quick 203h") || name.includes("203h") || name.includes("soldering station 90w")) return SMT_PRODUCT_IMAGES["QUICK-203H"];
  if (name.includes("fg-100") || name.includes("fg100") || name.includes("thermometer")) return SMT_PRODUCT_IMAGES["HAKKO-FG100"];
  if (name.includes("gs100") || name.includes("desoldering pump")) return SMT_PRODUCT_IMAGES["GS100"];
  if (name.includes("edsyn") || (name.includes("solder wire") && !name.includes("mask"))) return SMT_PRODUCT_IMAGES["EDSYN-SWS"];
  if (name.includes("solder mask") || name.includes("uv ink") || name.includes("blue uv")) return SMT_PRODUCT_IMAGES["BLUE-UV-INK"];
  if (name.includes("segger") || name.includes("j-link") || name.includes("jlink")) return SMT_PRODUCT_IMAGES["SEGGER-JLINK"];
  if (name.includes("xds220") || name.includes("spectrum digital")) return SMT_PRODUCT_IMAGES["XDS220-ISO"];
  if (name.includes("ontap") || name.includes("fs-9165") || name.includes("fs9165") || name.includes("jtag controller")) return SMT_PRODUCT_IMAGES["ONTAP-FS9165"];
  if (name.includes("14e ti") || name.includes("14e")) return SMT_PRODUCT_IMAGES["BH-ADP-14E-TI"];
  if (name.includes("60e mipi") || name.includes("60e")) return SMT_PRODUCT_IMAGES["BH-ADP-60E-MIPI"];
  if (name.includes("784662") || name.includes("ni 784662") || name.includes("ni-784662")) return SMT_PRODUCT_IMAGES["NI-784662-01"];
  if (name.includes("pogo pin") || name.includes("ict/fct") || name.includes("ict fct") || name.includes("pogo")) return SMT_PRODUCT_IMAGES["POGO-SPRING"];

  if (cat.includes("smt") || cat.includes("rework") || cat.includes("assembly") || sku.includes("SMT")) {
    if (subcat.includes("embedded") || fam.includes("board") || fam.includes("computer")) return SMT_PRODUCT_IMAGES["ARDUINO-UNO"];
    if (subcat.includes("rework") || fam.includes("rework")) return SMT_PRODUCT_IMAGES["DENON-RD500V"];
    if (subcat.includes("test") || fam.includes("jtag")) return SMT_PRODUCT_IMAGES["SEGGER-JLINK"];
    return SMT_PRODUCT_IMAGES["QUICK-203H"];
  }
  return null;
}

function getTestingProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && TESTING_PRODUCT_IMAGES[sku]) return TESTING_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(TESTING_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("fluke 107") || (name.includes("107") && name.includes("multimeter"))) return TESTING_PRODUCT_IMAGES["FLUKE-107"];
  if (name.includes("1587fc") || (name.includes("1587") && name.includes("insulation"))) return TESTING_PRODUCT_IMAGES["FLUKE-1587FC"];
  if (name.includes("15b+") || name.includes("15b-plus") || name.includes("15b plus") || (name.includes("15b") && name.includes("multimeter"))) return TESTING_PRODUCT_IMAGES["FLUKE-15B-PLUS"];
  if (name.includes("fluke 1775") || (name.includes("1775") && name.includes("power quality"))) return TESTING_PRODUCT_IMAGES["FLUKE-1775"];
  if (name.includes("fluke 179") || (name.includes("179") && (name.includes("multimeter") || name.includes("rms")))) return TESTING_PRODUCT_IMAGES["FLUKE-179"];
  if (name.includes("17b+") || name.includes("17b-plus") || name.includes("17b plus") || (name.includes("17b") && name.includes("multimeter"))) return TESTING_PRODUCT_IMAGES["FLUKE-17B-PLUS"];
  if (name.includes("scopemeter") || name.includes("190-104") || name.includes("190 104") || (name.includes("fluke 190") && name.includes("100mhz"))) return TESTING_PRODUCT_IMAGES["FLUKE-190-104"];
  if (name.includes("tl75") || (name.includes("fluke") && name.includes("hard point") && name.includes("test lead"))) return TESTING_PRODUCT_IMAGES["FLUKE-TL75"];
  if (name.includes("lcr-6300") || name.includes("lcr 6300") || (name.includes("gw instek") && name.includes("lcr"))) return TESTING_PRODUCT_IMAGES["GW-LCR-6300"];
  if (name.includes("dsg3065b") || name.includes("dsg3065") || (name.includes("rigol") && name.includes("signal generator"))) return TESTING_PRODUCT_IMAGES["RIGOL-DSG3065B"];
  if (name.includes("rsa5065") || (name.includes("rigol") && name.includes("spectrum analyzer"))) return TESTING_PRODUCT_IMAGES["RIGOL-RSA5065"];

  if (name.includes("flir e8") || name.includes("e8 pro") || (name.includes("flir") && name.includes("thermal"))) return TESTING_PRODUCT_IMAGES["FLIR-E8-PRO"];
  if (name.includes("tis75") || (name.includes("fluke") && name.includes("thermal imager"))) return TESTING_PRODUCT_IMAGES["FLUKE-TIS75"];
  if (name.includes("ht-5d") || name.includes("ht5d") || name.includes("hygrometer ht-5d")) return TESTING_PRODUCT_IMAGES["HYGROMETER-HT5D"];
  if (name.includes("particle plus") || name.includes("8503") || name.includes("airborne particle counter")) return TESTING_PRODUCT_IMAGES["PARTICLE-PLUS-8503"];
  if (name.includes("radeye") || name.includes("g20") || name.includes("gamma survey meter")) return TESTING_PRODUCT_IMAGES["RADEYE-G20"];

  if (name.includes("easylog") || (name.includes("usb") && name.includes("temperature data logger"))) return TESTING_PRODUCT_IMAGES["EASYLOG-USB-TEMP"];
  if (name.includes("lx-100") || (name.includes("microscope") && name.includes("hd4k"))) return TESTING_PRODUCT_IMAGES["LX-100-HD4K"];
  if (name.includes("mechanic d75t") || name.includes("d75t") || (name.includes("mechanic") && name.includes("microscope"))) return TESTING_PRODUCT_IMAGES["MECHANIC-D75T"];
  if (name.includes("process signal calibrator") || (name.includes("process") && name.includes("calibrator") && !name.includes("meter leads"))) return TESTING_PRODUCT_IMAGES["PROCESS-CALIBRATOR"];
  if (name.includes("ca-350") || name.includes("ca350") || (name.includes("ridgid") && name.includes("inspection camera"))) return TESTING_PRODUCT_IMAGES["RIDGID-CA350"];
  if (name.includes("sr-20") || name.includes("sr20") || (name.includes("ridgid") && name.includes("cable locator"))) return TESTING_PRODUCT_IMAGES["RIDGID-SR20"];

  if ((name.includes("vernier caliper") || name.includes("caliper")) && (name.includes("150") || name.includes("150mm"))) return TESTING_PRODUCT_IMAGES["VERNIER-CALIPER-150MM"];
  if ((name.includes("vernier caliper") || name.includes("caliper")) && (name.includes("300") || name.includes("300mm"))) return TESTING_PRODUCT_IMAGES["VERNIER-CALIPER-300MM"];
  if (name.includes("dwyer") || name.includes("magnehelic") || name.includes("2002")) return TESTING_PRODUCT_IMAGES["DWYER-2002"];
  if (name.includes("feeler gauge") && (name.includes("metal") || name.includes("blade set"))) return TESTING_PRODUCT_IMAGES["FEELER-GAUGE-METAL"];
  if (name.includes("293-240") || (name.includes("mitutoyo") && name.includes("micrometer"))) return TESTING_PRODUCT_IMAGES["MITUTOYO-293-240"];
  if (name.includes("pin gauge") || (name.includes("pin") && name.includes("gauge set"))) return TESTING_PRODUCT_IMAGES["PIN-GAUGE-SET"];
  if (name.includes("plastic feeler") || (name.includes("feeler") && name.includes("plastic"))) return TESTING_PRODUCT_IMAGES["PLASTIC-FEELER-GAUGE"];
  if (sku === "SG-TRIAXIAL" || sku.includes("SG-TRIAXIAL") || sku.includes("FR-1A12") || name.includes("strain gauge") || name.includes("tri-axial") || name.includes("fr-1a12")) {
    return TESTING_PRODUCT_IMAGES["SG-TRIAXIAL"];
  }

  return null;
}

function getItHardwareProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && IT_HARDWARE_PRODUCT_IMAGES[sku]) return IT_HARDWARE_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(IT_HARDWARE_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("adata") && (name.includes("ssd") || name.includes("512gb"))) return IT_HARDWARE_PRODUCT_IMAGES["ADATA-512GB-SSD"];
  if (name.includes("dell") && (name.includes("monitor") || name.includes("24"))) return IT_HARDWARE_PRODUCT_IMAGES["DELL-MONITOR-24"];
  if (name.includes("dell") && name.includes("keyboard")) return IT_HARDWARE_PRODUCT_IMAGES["DELL-KEYBOARD"];
  if (name.includes("dell") && name.includes("mouse")) return IT_HARDWARE_PRODUCT_IMAGES["DELL-MOUSE"];
  if (name.includes("ax210") || (name.includes("intel") && (name.includes("wi-fi") || name.includes("wifi") || name.includes("adapter")))) return IT_HARDWARE_PRODUCT_IMAGES["INTEL-AX210"];
  if (name.includes("p340") || name.includes("thinkstation") || (name.includes("lenovo") && name.includes("workstation"))) return IT_HARDWARE_PRODUCT_IMAGES["LENOVO-P340"];
  if (name.includes("programmable usb hub") || name.includes("usb hub 2x4") || name.includes("hub 2x4")) return IT_HARDWARE_PRODUCT_IMAGES["USB-HUB-2X4"];
  if (name.includes("870 evo") || (name.includes("samsung") && name.includes("ssd"))) return IT_HARDWARE_PRODUCT_IMAGES["SAMSUNG-870-EVO"];

  if (name.includes("pcb stand") && (name.includes("large") || name.includes("lg"))) return IT_HARDWARE_PRODUCT_IMAGES["PCB-STAND-LARGE"];
  if (name.includes("pcb stand") && (name.includes("small") || name.includes("sm"))) return IT_HARDWARE_PRODUCT_IMAGES["PCB-STAND-SMALL"];
  if (name.includes("pegboard") || name.includes("tool board with hooks")) return IT_HARDWARE_PRODUCT_IMAGES["PEGBOARD-HOOKS"];
  if ((name.includes("solder reel") || name.includes("reel rack")) && (name.includes("2-tier") || name.includes("2 tier"))) return IT_HARDWARE_PRODUCT_IMAGES["SOLDER-RACK-2TIER"];
  if ((name.includes("solder reel") || name.includes("reel rack")) && (name.includes("4-tier") || name.includes("4 tier"))) return IT_HARDWARE_PRODUCT_IMAGES["SOLDER-RACK-4TIER"];
  if (sku === "PCB-RACK-6" || name.includes("pcb storage rack") || name.includes("pcb rack") || (name.includes("storage rack") && (name.includes("pcb") || name.includes("6-slot"))) || (name.includes("pcb") && name.includes("6-slot"))) {
    return IT_HARDWARE_PRODUCT_IMAGES["PCB-RACK-6"];
  }

  return null;
}

function getLabellingProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && LABELLING_PRODUCT_IMAGES[sku]) return LABELLING_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(LABELLING_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("desktop label printer") || (name.includes("desktop") && name.includes("printer") && name.includes("label"))) return LABELLING_PRODUCT_IMAGES["DESKTOP-LABEL-PRINTER"];
  if (name.includes("xenon") || (name.includes("honeywell") && (name.includes("1950") || name.includes("scanner")))) return LABELLING_PRODUCT_IMAGES["HONEYWELL-1950"];
  if (name.includes("industrial label printer") || (name.includes("industrial") && name.includes("printer") && name.includes("label"))) return LABELLING_PRODUCT_IMAGES["INDUSTRIAL-LABEL-PRINTER"];
  if (name.includes("webscan") || name.includes("trucheck") || name.includes("optima") || name.includes("barcode verifier")) return LABELLING_PRODUCT_IMAGES["WEBSCAN-OPTIMA"];

  if (name.includes("barcode labels") || (name.includes("100x50") && name.includes("label"))) return LABELLING_PRODUCT_IMAGES["BARCODE-LABELS-100X50"];
  if (name.includes("calibration due") || name.includes("calibration stickers")) return LABELLING_PRODUCT_IMAGES["CALIBRATION-STICKERS"];
  if (name.includes("fifo labels") || name.includes("fifo")) return LABELLING_PRODUCT_IMAGES["FIFO-LABELS-ROLL"];
  if (name.includes("metal asset tags") || (name.includes("metal") && name.includes("asset tag"))) return LABELLING_PRODUCT_IMAGES["METAL-ASSET-TAGS"];
  if (name.includes("qc approved") || (name.includes("approved") && name.includes("green"))) return LABELLING_PRODUCT_IMAGES["QC-APPROVED-LABELS"];
  if (name.includes("qc rejected") || (name.includes("rejected") && name.includes("red"))) return LABELLING_PRODUCT_IMAGES["QC-REJECTED-LABELS"];
  if (name.includes("resin") && (name.includes("ribbon") || name.includes("110mm"))) return LABELLING_PRODUCT_IMAGES["RESIN-RIBBON-110MM"];
  if (name.includes("rfid uhf") || (name.includes("uhf labels") && name.includes("roll"))) return LABELLING_PRODUCT_IMAGES["RFID-UHF-LABELS"];
  if (name.includes("wax") && (name.includes("ribbon") || name.includes("110mm"))) return LABELLING_PRODUCT_IMAGES["WAX-RIBBON-110MM"];
  if (name.includes("ipj-a2010") || (name.includes("rfid") && name.includes("poe reader"))) return LABELLING_PRODUCT_IMAGES["RFID-POE-READER"];

  return null;
}

function getCablesProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && CABLES_PRODUCT_IMAGES[sku]) return CABLES_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(CABLES_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("om3") && (name.includes("5m") || name.includes("5 meter") || name.includes("5 m")) && name.includes("fiber")) return CABLES_PRODUCT_IMAGES["FIBER-OM3-LC-5M"];
  if (name.includes("om3") && (name.includes("3.5m") || name.includes("3.5 meter") || name.includes("3.5 m")) && name.includes("fiber")) return CABLES_PRODUCT_IMAGES["FIBER-OM3-LC-3.5M"];
  if (name.includes("mpo") && name.includes("om4") && (name.includes("20cm") || name.includes("20 cm"))) return CABLES_PRODUCT_IMAGES["MPO-OM4-20CM"];
  if (name.includes("mpo") && (name.includes("trunk") || name.includes("12-fiber") || name.includes("12 fiber")) && (name.includes("50cm") || name.includes("50 cm"))) return CABLES_PRODUCT_IMAGES["MPO-TRUNK-OM4-12F-50CM"];
  if (name.includes("om5") && (name.includes("20cm") || name.includes("20 cm"))) return CABLES_PRODUCT_IMAGES["OM5-LC-LC-20CM"];
  if (name.includes("single mode") && name.includes("lc") && (name.includes("patch cord") || name.includes("patch cable"))) return CABLES_PRODUCT_IMAGES["SM-LC-LC-PATCH-CORD"];

  if ((name.includes("cat6") || name.includes("lan cable")) && (name.includes("0.5m") || name.includes("0.5 meter") || name.includes("0.5 m"))) return CABLES_PRODUCT_IMAGES["LAN-CAT6-0.5M"];
  if ((name.includes("cat6") || name.includes("lan cable")) && (name.includes("1.5m") || name.includes("1.5 meter") || name.includes("1.5 m"))) return CABLES_PRODUCT_IMAGES["LAN-CAT6-1.5M"];
  if ((name.includes("cat6") || name.includes("lan cable")) && (name.includes("2m") || name.includes("2 meter") || name.includes("2 m"))) return CABLES_PRODUCT_IMAGES["LAN-CAT6-2M"];
  if ((name.includes("cat6") || name.includes("lan cable")) && (name.includes("1m") || name.includes("1 meter") || name.includes("1 m"))) return CABLES_PRODUCT_IMAGES["LAN-CAT6-1M"];
  if (name.includes("poe injector") || (name.includes("poe") && name.includes("802.3af"))) return CABLES_PRODUCT_IMAGES["POE-INJECTOR-8023AF"];
  if (sku === "POE-TESTER-24" || sku.includes("POE-TESTER") || name.includes("poe-tester") || name.includes("poe5") || (name.includes("poe") && name.includes("tester"))) return CABLES_PRODUCT_IMAGES["POE-TESTER-24"];
  if (name.includes("qsfp") || name.includes("40g sr4") || name.includes("aoc module")) return CABLES_PRODUCT_IMAGES["QSFP-40G-SR4"];
  if (sku === "SFP-1G-SX" || (name.includes("sfp") && (name.includes("1g base-sx") || name.includes("base-sx") || name.includes("1g sx")))) return CABLES_PRODUCT_IMAGES["SFP-1G-SX"];
  if (sku === "SFP-10G-SR" || sku.includes("10G-SR") || sku.includes("SFP-10G") || name.includes("sfp+") || name.includes("sfp +") || name.includes("10g base-sr") || (name.includes("10g") && name.includes("base-sr")) || (name.includes("10g") && name.includes("sr transceiver")) || (name.includes("sfp") && name.includes("10g"))) {
    return CABLES_PRODUCT_IMAGES["SFP-10G-SR"];
  }
  if (sku === "SFP-25G-SR" || name.includes("sfp28") || (name.includes("25g") && name.includes("sr transceiver"))) return CABLES_PRODUCT_IMAGES["SFP-25G-SR"];
  if (name.includes("tl-sg108etp") || (name.includes("8-port") && name.includes("poe switch") && name.includes("tp-link"))) return CABLES_PRODUCT_IMAGES["TL-SG108ETP"];
  if (name.includes("tl-sg116etp") || (name.includes("16-port") && name.includes("poe switch") && name.includes("tp-link"))) return CABLES_PRODUCT_IMAGES["TL-SG116ETP"];
  if (name.includes("ue300") || (name.includes("tp-link") && name.includes("rj45 adapter"))) return CABLES_PRODUCT_IMAGES["TP-LINK-UE300"];

  if (name.includes("hdmi") && (name.includes("2m") || name.includes("cable"))) return CABLES_PRODUCT_IMAGES["HDMI-CABLE-2M"];
  if (name.includes("gpib-usb-hs") || (name.includes("gpib") && name.includes("ni"))) return CABLES_PRODUCT_IMAGES["NI-GPIB-USB-HS"];
  if ((name.includes("type-a to type-c") || name.includes("a to c") || name.includes("usb-c")) && name.includes("2m")) return CABLES_PRODUCT_IMAGES["USB3-A-TO-C-2M"];
  if (name.includes("printer cable") || (name.includes("usb") && name.includes("a to b"))) return CABLES_PRODUCT_IMAGES["USB-PRINTER-A-TO-B-1.5M"];
  if (name.includes("usb to rs232") || name.includes("rs232 converter")) return CABLES_PRODUCT_IMAGES["USB-TO-RS232-CONV"];
  if (name.includes("rs422") || name.includes("rs485") || name.includes("usb to rs422")) return CABLES_PRODUCT_IMAGES["USB-TO-RS422-RS485-ADAPTER"];

  if (name.includes("30db") && (name.includes("250w") || name.includes("attenuator"))) return CABLES_PRODUCT_IMAGES["RF-ATT-30DB-250W-6GHZ"];
  if (name.includes("6db") && (name.includes("2w") || name.includes("attenuator"))) return CABLES_PRODUCT_IMAGES["RF-ATT-6DB-2W-6GHZ"];
  if (name.includes("belden 7807a") || (name.includes("belden") && name.includes("rg58"))) return CABLES_PRODUCT_IMAGES["BELDEN-7807A-RG58"];
  if (name.includes("818022025")) return CABLES_PRODUCT_IMAGES["ECT-RF-PROBE-818022025"];
  if (name.includes("818033486")) return CABLES_PRODUCT_IMAGES["ECT-RF-PROBE-818033486"];
  if (name.includes("818040823")) return CABLES_PRODUCT_IMAGES["ECT-RF-PROBE-818040823"];
  if (name.includes("818045873")) return CABLES_PRODUCT_IMAGES["ECT-RF-PROBE-818045873"];
  if (name.includes("gps generator") || (name.includes("gps antenna") && name.includes("generator"))) return CABLES_PRODUCT_IMAGES["GPS-GEN-ANTENNA-SET"];
  if (name.includes("sma to sma") && (name.includes("1.6m") || name.includes("lk200"))) return CABLES_PRODUCT_IMAGES["SMA-SMA-RF-1.6M-LK200"];

  return null;
}

function getToolsProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && TOOLS_PRODUCT_IMAGES[sku]) return TOOLS_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(TOOLS_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("copper foil") || (name.includes("copper") && name.includes("tape"))) return TOOLS_PRODUCT_IMAGES["COPPER-FOIL-TAPE"];
  if (name.includes("automatic wire stripper") || (name.includes("auto") && name.includes("stripper"))) return TOOLS_PRODUCT_IMAGES["AUTO-WIRE-STRIPPER"];
  if (name.includes("cable tie") && (name.includes("black") || name.includes("300mm") || name.includes("300 mm"))) return TOOLS_PRODUCT_IMAGES["CABLE-TIES-BLACK-300MM"];
  if (name.includes("cable tie") && (name.includes("white") || name.includes("200mm") || name.includes("200 mm"))) return TOOLS_PRODUCT_IMAGES["CABLE-TIES-WHITE-200MM"];
  if (name.includes("digital torque") || (name.includes("torque screwdriver") && !name.includes("pneumatic"))) return TOOLS_PRODUCT_IMAGES["DIGITAL-TORQUE-SCREWDRIVER"];
  if (name.includes("ferrule") && (name.includes("0.5") || name.includes("red"))) return TOOLS_PRODUCT_IMAGES["FERRULES-0-5MM-RED"];
  if (name.includes("ferrule") && (name.includes("1.5") || name.includes("black"))) return TOOLS_PRODUCT_IMAGES["FERRULES-1-5MM-BLACK"];
  if (name.includes("heat shrink") || (name.includes("shrink tube") && name.includes("black"))) return TOOLS_PRODUCT_IMAGES["HEAT-SHRINK-ASSORTED-BLACK"];
  if (name.includes("pneumatic screwdriver") || (name.includes("pneumatic") && name.includes("screwdriver"))) return TOOLS_PRODUCT_IMAGES["PNEUMATIC-SCREWDRIVER"];
  if (name.includes("precision screwdriver set") || (name.includes("precision") && name.includes("screwdriver") && name.includes("set"))) return TOOLS_PRODUCT_IMAGES["PRECISION-SCREWDRIVER-SET"];
  if (name.includes("pvc insulation tape") || (name.includes("pvc") && name.includes("insulation") && name.includes("tape")) || name.includes("pvc tape")) return TOOLS_PRODUCT_IMAGES["PVC-INSULATION-TAPE"];
  if (name.includes("ratchet crimping") || (name.includes("crimping tool") && name.includes("ferrule"))) return TOOLS_PRODUCT_IMAGES["RATCHET-CRIMPING-TOOL-FERRULES"];

  return null;
}

function getPowerProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && POWER_PRODUCT_IMAGES[sku]) return POWER_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(POWER_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("ametek") || name.includes("blower fan")) return POWER_PRODUCT_IMAGES["AMETEK-BLOWER-FAN"];
  if (name.includes("62012p") || (name.includes("chroma") && name.includes("power supply"))) return POWER_PRODUCT_IMAGES["CHROMA-62012P-40-120"];
  if (name.includes("eps-2030") || name.includes("eps 2030") || (name.includes("efocus") && name.includes("2030"))) return POWER_PRODUCT_IMAGES["EFOCUS-EPS-2030"];
  if (name.includes("ews 100-60") || name.includes("ews-100-60") || (name.includes("efocus") && name.includes("100-60"))) return POWER_PRODUCT_IMAGES["EFOCUS-EWS-100-60"];
  if (name.includes("10 kvar") || name.includes("epcos") || name.includes("reactor")) return POWER_PRODUCT_IMAGES["EPCOS-10-KVAR-REACTOR"];
  if (name.includes("general purpose relay") || (name.includes("relay") && name.includes("6a") && name.includes("24v"))) return POWER_PRODUCT_IMAGES["RELAY-SPDT-6A-24V"];
  if (name.includes("ice cube relay") || (name.includes("ice cube") && name.includes("relay"))) return POWER_PRODUCT_IMAGES["ICE-CUBE-RELAY-SPDT-24V"];
  if (name.includes("lrs-200-24") || (name.includes("meanwell") && (name.includes("lrs-200") || name.includes("smps")))) return POWER_PRODUCT_IMAGES["MEANWELL-LRS-200-24"];
  if (name.includes("ml15.051") || (name.includes("puls") && name.includes("power supply"))) return POWER_PRODUCT_IMAGES["PULS-ML15-051"];
  if (name.includes("siemens") && (name.includes("circuit breaker") || name.includes("mcb"))) return POWER_PRODUCT_IMAGES["SIEMENS-MCB-10A"];

  if (name.includes("4v110-06") || (name.includes("airtac") && name.includes("4v110"))) return POWER_PRODUCT_IMAGES["AIRTAC-4V110-06"];
  if (name.includes("tn20x100s") || (name.includes("airtac") && name.includes("cylinder"))) return POWER_PRODUCT_IMAGES["AIRTAC-TN20X100S"];
  if (name.includes("ar4") || (name.includes("pneumatic gripper") && name.includes("kit"))) return POWER_PRODUCT_IMAGES["AR4-PNEUMATIC-GRIPPER-KIT"];
  if (name.includes("fairchild") || name.includes("10232") || name.includes("pressure regulator")) return POWER_PRODUCT_IMAGES["FAIRCHILD-10232"];
  if (name.includes("sy7120") || (name.includes("smc") && name.includes("solenoid valve"))) return POWER_PRODUCT_IMAGES["SMC-SY7120-5LOZ-N11T"];

  return null;
}

function getEsdProductImage(product) {
  if (!product) return null;
  const sku = (product.sku || "").toUpperCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  if (sku && ESD_PRODUCT_IMAGES[sku]) return ESD_PRODUCT_IMAGES[sku];
  for (const [key, img] of Object.entries(ESD_PRODUCT_IMAGES)) {
    if (sku && sku.includes(key)) return img;
  }

  if (name.includes("insulating mat") || (name.includes("insulating") && name.includes("mat"))) return ESD_PRODUCT_IMAGES["INSULATING-MAT-1MX1M"];
  if (name.includes("esd coat") || (name.includes("coat") && name.includes("large"))) return ESD_PRODUCT_IMAGES["ESD-COAT-LARGE"];
  if (name.includes("finger cot") || name.includes("finger cots")) return ESD_PRODUCT_IMAGES["ESD-FINGER-COTS-SMALL"];
  if (name.includes("heel grounder") || name.includes("heel grounders")) return ESD_PRODUCT_IMAGES["ESD-HEEL-GROUNDERS-PAIR"];
  if (name.includes("esd safe glove") || name.includes("esd safe gloves") || (name.includes("esd") && name.includes("gloves"))) return ESD_PRODUCT_IMAGES["ESD-SAFE-GLOVES-MEDIUM"];
  if (name.includes("shielding bag") && (name.includes("4x6") || name.includes("esd"))) return ESD_PRODUCT_IMAGES["ESD-SHIELDING-BAG-4X6"];
  if (name.includes("wrist strap") && (name.includes("coil") || name.includes("cord")) && !name.includes("wireless")) return ESD_PRODUCT_IMAGES["ESD-WRIST-STRAP-COIL-CORD"];
  if (name.includes("moisture barrier") || name.includes("mbb")) return ESD_PRODUCT_IMAGES["MOISTURE-BARRIER-BAG-4X6"];
  if (name.includes("wireless") && name.includes("wrist strap")) return ESD_PRODUCT_IMAGES["WIRELESS-ESD-WRIST-STRAP"];

  if (name.includes("fmx-004") || name.includes("fmx 004") || name.includes("fmx004")) return ESD_PRODUCT_IMAGES["FMX-004-FIELD-METER"];
  if (name.includes("prs-801") || name.includes("prs 801") || name.includes("prostat")) return ESD_PRODUCT_IMAGES["PROSTAT-PRS-801RM"];
  if (name.includes("tc-93060a") || name.includes("tc93060a") || (name.includes("tescom") && name.includes("antenna coupler"))) return ESD_PRODUCT_IMAGES["TESCOM-TC-93060A"];
  if (name.includes("tc5970d") || name.includes("tc-5970d") || (name.includes("tescom") && name.includes("shield box"))) return ESD_PRODUCT_IMAGES["TESCOM-TC5970D"];
  if (name.includes("sd6058-c") || name.includes("sd6058") || name.includes("tojoin")) return ESD_PRODUCT_IMAGES["TOJOIN-SD6058-C"];
  if (name.includes("152-1-ce") || name.includes("152-1") || (name.includes("trek") && name.includes("test kit"))) return ESD_PRODUCT_IMAGES["TREK-152-1-CE"];
  if (name.includes("520-1-ce") || name.includes("520-1") || (name.includes("trek") && name.includes("fieldmeter"))) return ESD_PRODUCT_IMAGES["TREK-520-1-CE"];
  if (name.includes("523-1") || (name.includes("trek") && name.includes("voltmeter"))) return ESD_PRODUCT_IMAGES["TREK-523-1"];

  return null;
}

function isProductImageUserProvided(product) {
  if (!product) return false;
  if (getSmtProductImage(product) !== null) return true;
  if (getTestingProductImage(product) !== null) return true;
  if (getItHardwareProductImage(product) !== null) return true;
  if (getLabellingProductImage(product) !== null) return true;
  if (getCablesProductImage(product) !== null) return true;
  if (getToolsProductImage(product) !== null) return true;
  if (getPowerProductImage(product) !== null) return true;
  if (getEsdProductImage(product) !== null) return true;
  return false;
}

function getProductPrimaryImage(product) {
  if (!product) return EXISTING_IMAGES.cables;

  // 1. Prioritize user provided authentic images across 8 category systems
  const smtImage = getSmtProductImage(product);
  if (smtImage) return smtImage;

  const testingImage = getTestingProductImage(product);
  if (testingImage) return testingImage;

  const itImage = getItHardwareProductImage(product);
  if (itImage) return itImage;

  const labelImage = getLabellingProductImage(product);
  if (labelImage) return labelImage;

  const cablesImage = getCablesProductImage(product);
  if (cablesImage) return cablesImage;

  const toolsImage = getToolsProductImage(product);
  if (toolsImage) return toolsImage;

  const powerImage = getPowerProductImage(product);
  if (powerImage) return powerImage;

  const esdImage = getEsdProductImage(product);
  if (esdImage) return esdImage;

  // 2. Semantic category fallbacks
  const sku = (product.sku || "").toUpperCase();
  const name = (product.product_name || "").toLowerCase();
  const cat = (product.category_name || "").toLowerCase();
  const fam = (product.family_name || "").toLowerCase();

  if (sku.includes("ICA") || cat.includes("cable") || cat.includes("connect") || fam.includes("cable") || name.includes("cabling") || name.includes("jumpers")) {
    if (sku.includes("PWR") || cat.includes("power") || name.includes("power")) return EXISTING_IMAGES.power;
    return EXISTING_IMAGES.cables;
  }

  if (sku.includes("TST") || cat.includes("test") || cat.includes("measur") || fam.includes("meter") || name.includes("leads") || name.includes("probe") || name.includes("calibrat") || name.includes("multimeter")) {
    return EXISTING_IMAGES.test;
  }

  if (cat.includes("label") || cat.includes("ident") || sku.includes("MAC")) {
    if (name.includes("mac address") || sku.includes("MAC")) return EXISTING_IMAGES.test;
    if (name.includes("scanner") || name.includes("verifier") || fam.includes("scanner") || sku.includes("SCAN") || sku.includes("HONEYWELL")) return "/images/card_8_tools.png";
    if (name.includes("printer") || fam.includes("printer") || sku.includes("PRNT") || sku.includes("ZEBRA")) return "/images/card_10_red_parts.png";
    if (name.includes("rfid") || fam.includes("rfid") || sku.includes("RFID")) return "/images/card_5_board.png";
    if (name.includes("ribbon") || name.includes("sticker") || name.includes("tag") || name.includes("fifo")) return "/images/card_3_blue_strap.png";
    return "/images/card_10_red_parts.png";
  }

  if (cat.includes("workstation") || cat.includes("hardware") || name.includes("pcb stand")) return "/images/card_5_board.png";
  if (sku.includes("RF") || cat.includes("rf") || cat.includes("wave") || fam.includes("antenna") || name.includes("coaxial") || name.includes("antenna") || name.includes("coupler")) return EXISTING_IMAGES.rf;
  if (sku.includes("MRO") || cat.includes("tool") || cat.includes("mro") || name.includes("crimping") || name.includes("pliers") || name.includes("tape")) return EXISTING_IMAGES.tools;
  if (sku.includes("NET") || cat.includes("net") || name.includes("ethernet") || name.includes("fiber") || name.includes("switch")) return EXISTING_IMAGES.net;
  if (sku.includes("PWR") || cat.includes("power") || cat.includes("electr") || name.includes("power cord") || name.includes("regulator")) return EXISTING_IMAGES.power;
  if (sku.includes("CST") || sku.includes("ESD") || cat.includes("harness") || cat.includes("esd") || name.includes("harness") || name.includes("wrist strap")) return EXISTING_IMAGES.custom;

  return EXISTING_IMAGES.cables;
}

function getProductThumbnails(product) {
  const primary = getProductPrimaryImage(product);
  if (!product) return [primary];

  const sku = (product.sku || "").toUpperCase().trim();
  const cat = (product.category_name || "").toLowerCase().trim();
  const name = (product.product_name || "").toLowerCase().trim();

  const isUserProvided = isProductImageUserProvided(product);

  // If user provided, check specific gallery
  if (isUserProvided) {
    if (sku && PRODUCT_GALLERY_IMAGES[sku] && PRODUCT_GALLERY_IMAGES[sku].length > 0) {
      return PRODUCT_GALLERY_IMAGES[sku];
    }
    for (const [key, images] of Object.entries(PRODUCT_GALLERY_IMAGES)) {
      if ((sku && sku.includes(key)) || (name && name.includes(key.toLowerCase()))) {
        if (images && images.length > 0) return images;
      }
    }
    return [primary];
  }

  // Showcase 4-image galleries for broader categories
  if (cat.includes("test") || cat.includes("measur") || cat.includes("label") || sku.includes("TST") || sku.includes("MAC")) {
    return [EXISTING_IMAGES.test, EXISTING_IMAGES.custom, EXISTING_IMAGES.cables, EXISTING_IMAGES.rf];
  }
  if (cat.includes("cable") || cat.includes("connect") || sku.includes("ICA")) {
    return [EXISTING_IMAGES.cables, EXISTING_IMAGES.net, EXISTING_IMAGES.custom, EXISTING_IMAGES.power];
  }
  if (cat.includes("rf") || cat.includes("wave") || sku.includes("RF")) {
    return [EXISTING_IMAGES.rf, EXISTING_IMAGES.power, EXISTING_IMAGES.cables, EXISTING_IMAGES.net];
  }
  if (cat.includes("tool") || cat.includes("mro") || sku.includes("MRO")) {
    return [EXISTING_IMAGES.tools, EXISTING_IMAGES.custom, EXISTING_IMAGES.test, EXISTING_IMAGES.cables];
  }
  if (cat.includes("net") || sku.includes("NET")) {
    return [EXISTING_IMAGES.net, EXISTING_IMAGES.cables, EXISTING_IMAGES.power, EXISTING_IMAGES.rf];
  }
  if (cat.includes("power") || sku.includes("PWR")) {
    return [EXISTING_IMAGES.power, EXISTING_IMAGES.cables, EXISTING_IMAGES.custom, EXISTING_IMAGES.net];
  }

  return [primary, EXISTING_IMAGES.cables, EXISTING_IMAGES.test, EXISTING_IMAGES.tools];
}

module.exports = {
  getProductPrimaryImage,
  getProductThumbnails,
  SMT_PRODUCT_IMAGES,
  TESTING_PRODUCT_IMAGES,
  IT_HARDWARE_PRODUCT_IMAGES,
  LABELLING_PRODUCT_IMAGES,
  CABLES_PRODUCT_IMAGES,
  TOOLS_PRODUCT_IMAGES,
  POWER_PRODUCT_IMAGES,
  ESD_PRODUCT_IMAGES,
  EXISTING_IMAGES,
  PRODUCT_GALLERY_IMAGES
};
