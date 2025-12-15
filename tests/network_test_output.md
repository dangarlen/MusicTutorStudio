## Devices

| Name | Category | Location | Notes |
|------|----------|----------|-------|
| Verizon Optical Network Terminal (ONT) | Core Network | Closet | Fiber |
| MoCA Ethernet Adapter | Core Network | Shelf – NSS | Ethernet + Power |
| TP-Link TL-SG116 Gigabit Switch | Core Network | Shelf – NSS | Ethernet + Power; 2 spare Ethernet ports available |
| Verizon Router CR1000A | Wireless Router | Closet | Wireless |
| Google Nest Hub Smart Display | AI Assistant | Office | Wireless |
| YoLink Speaker Hub | IoT Hubs | Shelf – NSS | Ethernet + Power |
| Verizon MicroCell | IoT Hubs | Shelf – NSS | Ethernet + Power |
| Lutron Caseta Wireless Hub | IoT Hubs | Shelf – NSS | Ethernet + Power |
| Flic Hub | IoT Hubs | Shelf – NSS | Ethernet + Power |
| Flic 2 Hub | IoT Hubs | Shelf – NSS | Ethernet + Power |
| Philips Hue Hub | IoT Hubs | Shelf – NSS | Ethernet + Power |
| Ooma Telo Base Station | VoIP Phones | Shelf – RPC–3 top | Ethernet + Power |
| Synology DS720+ NAS | NAS | Shelf – NSS | Ethernet + Power |
| WD MyBookLive NAS | NAS | Shelf – NSS | Ethernet + Power |
| HDHomeRun Duo | TV Tuner | Shelf – NSS | Ethernet + Power |

## Connections

- **ont** → **moca_adapter** (Cable)
- **ont** → **router** (Ethernet)
- **tl_sg116** → **moca_adapter** (Ethernet)
- **router** → **google_nest** (Wireless)
- **tl_sg116** → **yolink_hub** (Ethernet)
- **tl_sg116** → **verizon_microcell** (Ethernet)
- **tl_sg116** → **lutron_caseta** (Ethernet)
- **tl_sg116** → **flic_hub** (Ethernet)
- **tl_sg116** → **flic2_hub** (Ethernet)
- **tl_sg116** → **philips_hue_hub** (Ethernet)
- **tl_sg116** → **synology_ds720** (Ethernet)
- **tl_sg116** → **mybooklive** (Ethernet)
- **tl_sg116** → **hdhomerun_duo** (Ethernet)
- **tl_sg116** → **ooma_voip** (Ethernet)
