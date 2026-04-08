const fs = require('fs');
const path = require('path');

const data = `E0151,CAN_01,DEP_26,voto_candidato_departamento,53.02,46877,0,estimado,"Paloma Valencia en Arauca: 53.02% (46,877 votos est.)"
E0152,CAN_02,DEP_26,voto_candidato_departamento,19.84,16708,1,estimado,"Iván Cepeda en Arauca: 19.84% (16,708 votos est.)"
E0153,CAN_03,DEP_26,voto_candidato_departamento,7.26,6062,1,estimado,"Claudia López en Arauca: 7.26% (6,062 votos est.)"
E0154,CAN_04,DEP_26,voto_candidato_departamento,1.02,970,1,estimado,Roy Barreras en Arauca: 1.02% (970 votos est.)
E0155,CAN_05,DEP_26,voto_candidato_departamento,19.62,21434,0,estimado,"Juan Daniel Oviedo en Arauca: 19.62% (21,434 votos est.)"
E0156,CAN_06,DEP_26,voto_candidato_departamento,3.1,2786,1,estimado,"Sergio Fajardo en Arauca: 3.1% (2,786 votos est.)"
E0157,CAN_01,DEP_27,voto_candidato_departamento,51.08,64294,1,estimado,"Paloma Valencia en Casanare: 51.08% (64,294 votos est.)"
E0158,CAN_02,DEP_27,voto_candidato_departamento,17.68,23532,0,estimado,"Iván Cepeda en Casanare: 17.68% (23,532 votos est.)"
E0159,CAN_03,DEP_27,voto_candidato_departamento,7.61,10073,1,estimado,"Claudia López en Casanare: 7.61% (10,073 votos est.)"
E0160,CAN_04,DEP_27,voto_candidato_departamento,2.16,3682,0,estimado,"Roy Barreras en Casanare: 2.16% (3,682 votos est.)"
E0161,CAN_05,DEP_27,voto_candidato_departamento,19.21,31622,1,estimado,"Juan Daniel Oviedo en Casanare: 19.21% (31,622 votos est.)"
E0162,CAN_06,DEP_27,voto_candidato_departamento,2.31,3557,1,estimado,"Sergio Fajardo en Casanare: 2.31% (3,557 votos est.)"
E0163,CAN_01,DEP_28,voto_candidato_departamento,30.19,7891,0,estimado,"Paloma Valencia en Amazonas: 30.19% (7,891 votos est.)"
E0164,CAN_02,DEP_28,voto_candidato_departamento,28.26,7723,1,estimado,"Iván Cepeda en Amazonas: 28.26% (7,723 votos est.)"
E0165,CAN_03,DEP_28,voto_candidato_departamento,8.85,2139,1,estimado,"Claudia López en Amazonas: 8.85% (2,139 votos est.)"
E0166,CAN_04,DEP_28,voto_candidato_departamento,4.94,1043,1,estimado,"Roy Barreras en Amazonas: 4.94% (1,043 votos est.)"
E0167,CAN_05,DEP_28,voto_candidato_departamento,15.3,3932,0,estimado,"Juan Daniel Oviedo en Amazonas: 15.3% (3,932 votos est.)"
E0168,CAN_06,DEP_28,voto_candidato_departamento,4.71,1308,1,estimado,"Sergio Fajardo en Amazonas: 4.71% (1,308 votos est.)"
E0169,CAN_01,DEP_29,voto_candidato_departamento,29.59,4478,0,estimado,"Paloma Valencia en Guainía: 29.59% (4,478 votos est.)"
E0170,CAN_02,DEP_29,voto_candidato_departamento,32.1,4011,1,estimado,"Iván Cepeda en Guainía: 32.1% (4,011 votos est.)"
E0171,CAN_03,DEP_29,voto_candidato_departamento,10.18,1552,1,estimado,"Claudia López en Guainía: 10.18% (1,552 votos est.)"
E0172,CAN_04,DEP_29,voto_candidato_departamento,2.39,350,1,estimado,Roy Barreras en Guainía: 2.39% (350 votos est.)
E0173,CAN_05,DEP_29,voto_candidato_departamento,11.49,1321,0,estimado,"Juan Daniel Oviedo en Guainía: 11.49% (1,321 votos est.)"
E0174,CAN_06,DEP_29,voto_candidato_departamento,1.04,142,1,estimado,Sergio Fajardo en Guainía: 1.04% (142 votos est.)
E0175,CAN_01,DEP_30,voto_candidato_departamento,52.85,10883,1,estimado,"Paloma Valencia en Vichada: 52.85% (10,883 votos est.)"
E0176,CAN_02,DEP_30,voto_candidato_departamento,22.27,4775,0,estimado,"Iván Cepeda en Vichada: 22.27% (4,775 votos est.)"
E0177,CAN_03,DEP_30,voto_candidato_departamento,5.86,1278,1,estimado,"Claudia López en Vichada: 5.86% (1,278 votos est.)"
E0178,CAN_04,DEP_30,voto_candidato_departamento,1.19,285,0,estimado,Roy Barreras en Vichada: 1.19% (285 votos est.)
E0179,CAN_05,DEP_30,voto_candidato_departamento,21.35,4976,1,estimado,"Juan Daniel Oviedo en Vichada: 21.35% (4,976 votos est.)"
E0180,CAN_06,DEP_30,voto_candidato_departamento,4.01,898,1,estimado,Sergio Fajardo en Vichada: 4.01% (898 votos est.)
E0181,CAN_01,DEP_31,voto_candidato_departamento,29.19,3198,0,estimado,"Paloma Valencia en Vaupés: 29.19% (3,198 votos est.)"
E0182,CAN_02,DEP_31,voto_candidato_departamento,27.17,2687,1,estimado,"Iván Cepeda en Vaupés: 27.17% (2,687 votos est.)"
E0183,CAN_03,DEP_31,voto_candidato_departamento,8.71,779,1,estimado,Claudia López en Vaupés: 8.71% (779 votos est.)
E0184,CAN_04,DEP_31,voto_candidato_departamento,5.43,673,1,estimado,Roy Barreras en Vaupés: 5.43% (673 votos est.)
E0185,CAN_05,DEP_31,voto_candidato_departamento,9.54,884,0,estimado,Juan Daniel Oviedo en Vaupés: 9.54% (884 votos est.)
E0186,CAN_06,DEP_31,voto_candidato_departamento,3.98,427,1,estimado,Sergio Fajardo en Vaupés: 3.98% (427 votos est.)
E0187,CAN_01,DEP_32,voto_candidato_departamento,39.28,14402,0,estimado,"Paloma Valencia en San Andrés: 39.28% (14,402 votos est.)"
E0188,CAN_02,DEP_32,voto_candidato_departamento,19.82,7285,0,estimado,"Iván Cepeda en San Andrés: 19.82% (7,285 votos est.)"
E0189,CAN_03,DEP_32,voto_candidato_departamento,8.65,2848,1,estimado,"Claudia López en San Andrés: 8.65% (2,848 votos est.)"
E0190,CAN_04,DEP_32,voto_candidato_departamento,1.76,550,0,estimado,Roy Barreras en San Andrés: 1.76% (550 votos est.)
E0191,CAN_05,DEP_32,voto_candidato_departamento,13.5,4588,0,estimado,"Juan Daniel Oviedo en San Andrés: 13.5% (4,588 votos est.)"
E0192,CAN_06,DEP_32,voto_candidato_departamento,1.21,342,1,estimado,Sergio Fajardo en San Andrés: 1.21% (342 votos est.)
E0193,CAN_01,DEP_33,voto_candidato_departamento,56.66,54925,1,estimado,"Paloma Valencia en Exterior EEUU: 56.66% (54,925 votos est.)"
E0194,CAN_02,DEP_33,voto_candidato_departamento,23.4,19056,0,estimado,"Iván Cepeda en Exterior EEUU: 23.4% (19,056 votos est.)"
E0195,CAN_03,DEP_33,voto_candidato_departamento,6.9,6560,1,estimado,"Claudia López en Exterior EEUU: 6.9% (6,560 votos est.)"
E0196,CAN_04,DEP_33,voto_candidato_departamento,2.05,2267,0,estimado,"Roy Barreras en Exterior EEUU: 2.05% (2,267 votos est.)"
E0197,CAN_05,DEP_33,voto_candidato_departamento,17.67,18110,1,estimado,"Juan Daniel Oviedo en Exterior EEUU: 17.67% (18,110 votos est.)"
E0198,CAN_06,DEP_33,voto_candidato_departamento,0.5,487,1,estimado,Sergio Fajardo en Exterior EEUU: 0.5% (487 votos est.)
E0199,CAN_01,DEP_34,voto_candidato_departamento,59.29,26922,0,estimado,"Paloma Valencia en Exterior Europa: 59.29% (26,922 votos est.)"
E0200,CAN_02,DEP_34,voto_candidato_departamento,23.55,12726,1,estimado,"Iván Cepeda en Exterior Europa: 23.55% (12,726 votos est.)"
E0201,CAN_03,DEP_34,voto_candidato_departamento,11.01,6137,1,estimado,"Claudia López en Exterior Europa: 11.01% (6,137 votos est.)"
E0202,CAN_04,DEP_34,voto_candidato_departamento,0.93,437,1,estimado,Roy Barreras en Exterior Europa: 0.93% (437 votos est.)
E0203,CAN_05,DEP_34,voto_candidato_departamento,17.61,8365,0,estimado,"Juan Daniel Oviedo en Exterior Europa: 17.61% (8,365 votos est.)"
E0204,CAN_06,DEP_34,voto_candidato_departamento,0.5,268,1,estimado,Sergio Fajardo en Exterior Europa: 0.5% (268 votos est.)
E0205,MED_01,CAN_01,cobertura_medio_candidato,72.1,2018799,0,estimado_encuesta,El Tiempo → Paloma Valencia: cobertura favorable 72.1%
E0206,MED_01,CAN_02,cobertura_medio_candidato,25.8,722400,0,estimado_encuesta,El Tiempo → Iván Cepeda: cobertura favorable 25.8%
E0207,MED_01,CAN_03,cobertura_medio_candidato,56.4,1579200,0,estimado_encuesta,El Tiempo → Claudia López: cobertura favorable 56.4%
E0208,MED_01,CAN_04,cobertura_medio_candidato,25.0,700000,0,estimado_encuesta,El Tiempo → Roy Barreras: cobertura favorable 25.0%
E0209,MED_01,CAN_05,cobertura_medio_candidato,66.7,1867600,1,estimado_encuesta,El Tiempo → Juan Daniel Oviedo: cobertura favorable 66.7%
E0210,MED_01,CAN_06,cobertura_medio_candidato,53.7,1503600,0,estimado_encuesta,El Tiempo → Sergio Fajardo: cobertura favorable 53.7%
E0211,MED_02,CAN_01,cobertura_medio_candidato,17.2,206400,0,estimado_encuesta,El Espectador → Paloma Valencia: cobertura favorable 17.2%
E0212,MED_02,CAN_02,cobertura_medio_candidato,71.5,858000,0,estimado_encuesta,El Espectador → Iván Cepeda: cobertura favorable 71.5%
E0213,MED_02,CAN_03,cobertura_medio_candidato,56.1,673200,0,estimado_encuesta,El Espectador → Claudia López: cobertura favorable 56.1%
E0214,MED_02,CAN_04,cobertura_medio_candidato,61.3,735600,1,estimado_encuesta,El Espectador → Roy Barreras: cobertura favorable 61.3%
E0215,MED_02,CAN_05,cobertura_medio_candidato,34.9,418800,0,estimado_encuesta,El Espectador → Juan Daniel Oviedo: cobertura favorable 34.9%
E0216,MED_02,CAN_06,cobertura_medio_candidato,54.8,657600,0,estimado_encuesta,El Espectador → Sergio Fajardo: cobertura favorable 54.8%
E0217,MED_03,CAN_01,cobertura_medio_candidato,88.7,1596600,1,estimado_encuesta,Semana → Paloma Valencia: cobertura favorable 88.7%
E0218,MED_03,CAN_02,cobertura_medio_candidato,12.3,221400,0,estimado_encuesta,Semana → Iván Cepeda: cobertura favorable 12.3%
E0219,MED_03,CAN_03,cobertura_medio_candidato,38.8,698400,0,estimado_encuesta,Semana → Claudia López: cobertura favorable 38.8%
E0220,MED_03,CAN_04,cobertura_medio_candidato,21.2,381600,0,estimado_encuesta,Semana → Roy Barreras: cobertura favorable 21.2%
E0221,MED_03,CAN_05,cobertura_medio_candidato,71.5,1287000,0,estimado_encuesta,Semana → Juan Daniel Oviedo: cobertura favorable 71.5%
E0222,MED_03,CAN_06,cobertura_medio_candidato,38.5,693000,0,estimado_encuesta,Semana → Sergio Fajardo: cobertura favorable 38.5%
E0223,MED_04,CAN_01,cobertura_medio_candidato,54.1,4598500,0,estimado_encuesta,Caracol TV → Paloma Valencia: cobertura favorable 54.1%
E0224,MED_04,CAN_02,cobertura_medio_candidato,41.2,3502000,0,estimado_encuesta,Caracol TV → Iván Cepeda: cobertura favorable 41.2%
E0225,MED_04,CAN_03,cobertura_medio_candidato,60.2,5117000,1,estimado_encuesta,Caracol TV → Claudia López: cobertura favorable 60.2%
E0226,MED_04,CAN_04,cobertura_medio_candidato,53.3,4530500,0,estimado_encuesta,Caracol TV → Roy Barreras: cobertura favorable 53.3%
E0227,MED_04,CAN_05,cobertura_medio_candidato,56.8,4828000,0,estimado_encuesta,Caracol TV → Juan Daniel Oviedo: cobertura favorable 56.8%
E0228,MED_04,CAN_06,cobertura_medio_candidato,59.6,5066000,1,estimado_encuesta,Caracol TV → Sergio Fajardo: cobertura favorable 59.6%
E0229,MED_05,CAN_01,cobertura_medio_candidato,72.9,5248800,0,estimado_encuesta,RCN TV → Paloma Valencia: cobertura favorable 72.9%
E0230,MED_05,CAN_02,cobertura_medio_candidato,17.8,1281600,0,estimado_encuesta,RCN TV → Iván Cepeda: cobertura favorable 17.8%
E0231,MED_05,CAN_03,cobertura_medio_candidato,57.8,4161600,0,estimado_encuesta,RCN TV → Claudia López: cobertura favorable 57.8%
E0232,MED_05,CAN_04,cobertura_medio_candidato,25.9,1864800,0,estimado_encuesta,RCN TV → Roy Barreras: cobertura favorable 25.9%
E0233,MED_05,CAN_05,cobertura_medio_candidato,67.9,4888800,1,estimado_encuesta,RCN TV → Juan Daniel Oviedo: cobertura favorable 67.9%
E0234,MED_05,CAN_06,cobertura_medio_candidato,53.1,3823200,0,estimado_encuesta,RCN TV → Sergio Fajardo: cobertura favorable 53.1%
E0235,MED_06,CAN_01,cobertura_medio_candidato,87.5,2800000,1,estimado_encuesta,Blu Radio → Paloma Valencia: cobertura favorable 87.5%
E0236,MED_06,CAN_02,cobertura_medio_candidato,7.3,233600,0,estimado_encuesta,Blu Radio → Iván Cepeda: cobertura favorable 7.3%
E0237,MED_06,CAN_03,cobertura_medio_candidato,38.3,1225599,0,estimado_encuesta,Blu Radio → Claudia López: cobertura favorable 38.3%
E0238,MED_06,CAN_04,cobertura_medio_candidato,20.1,643200,0,estimado_encuesta,Blu Radio → Roy Barreras: cobertura favorable 20.1%
E0239,MED_06,CAN_05,cobertura_medio_candidato,68.3,2185600,0,estimado_encuesta,Blu Radio → Juan Daniel Oviedo: cobertura favorable 68.3%
E0240,MED_06,CAN_06,cobertura_medio_candidato,44.1,1411200,0,estimado_encuesta,Blu Radio → Sergio Fajardo: cobertura favorable 44.1%
E0241,MED_07,CAN_01,cobertura_medio_candidato,12.2,183000,0,estimado_encuesta,Las2Orillas → Paloma Valencia: cobertura favorable 12.2%
E0242,MED_07,CAN_02,cobertura_medio_candidato,91.6,1374000,1,estimado_encuesta,Las2Orillas → Iván Cepeda: cobertura favorable 91.6%
E0243,MED_07,CAN_03,cobertura_medio_candidato,39.0,585000,0,estimado_encuesta,Las2Orillas → Claudia López: cobertura favorable 39.0%
E0244,MED_07,CAN_04,cobertura_medio_candidato,56.8,852000,0,estimado_encuesta,Las2Orillas → Roy Barreras: cobertura favorable 56.8%
E0245,MED_07,CAN_05,cobertura_medio_candidato,21.1,316500,0,estimado_encuesta,Las2Orillas → Juan Daniel Oviedo: cobertura favorable 21.1%
E0246,MED_07,CAN_06,cobertura_medio_candidato,37.2,558000,0,estimado_encuesta,Las2Orillas → Sergio Fajardo: cobertura favorable 37.2%
E0247,MED_08,CAN_01,cobertura_medio_candidato,46.9,5628000,1,estimado_encuesta,TikTok_Colombia → Paloma Valencia: cobertura favorable 46.9%
E0248,MED_08,CAN_02,cobertura_medio_candidato,43.5,5220000,1,estimado_encuesta,TikTok_Colombia → Iván Cepeda: cobertura favorable 43.5%
E0249,MED_08,CAN_03,cobertura_medio_candidato,52.9,6348000,1,estimado_encuesta,TikTok_Colombia → Claudia López: cobertura favorable 52.9%
E0250,MED_08,CAN_04,cobertura_medio_candidato,47.1,5652000,1,estimado_encuesta,TikTok_Colombia → Roy Barreras: cobertura favorable 47.1%
E0251,MED_08,CAN_05,cobertura_medio_candidato,51.0,6120000,1,estimado_encuesta,TikTok_Colombia → Juan Daniel Oviedo: cobertura favorable 51.0%
E0252,MED_08,CAN_06,cobertura_medio_candidato,48.8,5856000,1,estimado_encuesta,TikTok_Colombia → Sergio Fajardo: cobertura favorable 48.8%
E0253,MED_01,DEP_01,alcance_medio_departamento,51.7,3722400,0,estimado,El Tiempo → Bogotá D.C.: alcance 51.7%
E0254,MED_01,DEP_02,alcance_medio_departamento,65.8,3158400,0,estimado,El Tiempo → Antioquia: alcance 65.8%
E0255,MED_01,DEP_03,alcance_medio_departamento,63.8,1977800,0,estimado,El Tiempo → Valle del Cauca: alcance 63.8%
E0256,MED_01,DEP_04,alcance_medio_departamento,51.1,883748,0,estimado,El Tiempo → Atlántico: alcance 51.1%
E0257,MED_01,DEP_05,alcance_medio_departamento,54.4,979200,0,estimado,El Tiempo → Cundinamarca: alcance 54.4%
E0258,MED_01,DEP_06,alcance_medio_departamento,68.1,1035119,0,estimado,El Tiempo → Santander: alcance 68.1%
E0259,MED_01,DEP_07,alcance_medio_departamento,55.7,835500,0,estimado,El Tiempo → Bolívar: alcance 55.7%
E0260,MED_01,DEP_08,alcance_medio_departamento,68.2,750200,0,estimado,El Tiempo → Nariño: alcance 68.2%
E0261,MED_01,DEP_09,alcance_medio_departamento,58.7,575260,0,estimado,El Tiempo → Córdoba: alcance 58.7%
E0262,MED_01,DEP_10,alcance_medio_departamento,51.5,489250,0,estimado,El Tiempo → Norte de Santander: alcance 51.5%
E0263,MED_02,DEP_01,alcance_medio_departamento,63.0,4536000,0,estimado,El Espectador → Bogotá D.C.: alcance 63.0%
E0264,MED_02,DEP_02,alcance_medio_departamento,53.6,2572800,0,estimado,El Espectador → Antioquia: alcance 53.6%
E0265,MED_02,DEP_03,alcance_medio_departamento,71.3,2210300,0,estimado,El Espectador → Valle del Cauca: alcance 71.3%
E0266,MED_02,DEP_04,alcance_medio_departamento,61.5,1063611,0,estimado,El Espectador → Atlántico: alcance 61.5%
E0267,MED_02,DEP_05,alcance_medio_departamento,51.0,918000,0,estimado,El Espectador → Cundinamarca: alcance 51.0%
E0268,MED_02,DEP_06,alcance_medio_departamento,55.0,836000,0,estimado,El Espectador → Santander: alcance 55.0%
E0269,MED_02,DEP_07,alcance_medio_departamento,59.0,885000,0,estimado,El Espectador → Bolívar: alcance 59.0%
E0270,MED_02,DEP_08,alcance_medio_departamento,57.6,633600,0,estimado,El Espectador → Nariño: alcance 57.6%
E0271,MED_02,DEP_09,alcance_medio_departamento,48.5,475300,0,estimado,El Espectador → Córdoba: alcance 48.5%
E0272,MED_02,DEP_10,alcance_medio_departamento,65.2,619400,0,estimado,El Espectador → Norte de Santander: alcance 65.2%
E0273,MED_03,DEP_01,alcance_medio_departamento,64.2,4622400,0,estimado,Semana → Bogotá D.C.: alcance 64.2%
E0274,MED_03,DEP_02,alcance_medio_departamento,56.1,2692800,0,estimado,Semana → Antioquia: alcance 56.1%
E0275,MED_03,DEP_03,alcance_medio_departamento,64.3,1993300,0,estimado,Semana → Valle del Cauca: alcance 64.3%
E0276,MED_03,DEP_04,alcance_medio_departamento,70.1,1212343,0,estimado,Semana → Atlántico: alcance 70.1%
E0277,MED_03,DEP_05,alcance_medio_departamento,69.8,1256400,0,estimado,Semana → Cundinamarca: alcance 69.8%
E0278,MED_03,DEP_06,alcance_medio_departamento,68.3,1038160,0,estimado,Semana → Santander: alcance 68.3%
E0279,MED_03,DEP_07,alcance_medio_departamento,70.9,1063500,0,estimado,Semana → Bolívar: alcance 70.9%
E0280,MED_03,DEP_08,alcance_medio_departamento,64.0,704000,0,estimado,Semana → Nariño: alcance 64.0%
E0281,MED_03,DEP_09,alcance_medio_departamento,61.1,598780,0,estimado,Semana → Córdoba: alcance 61.1%
E0282,MED_03,DEP_10,alcance_medio_departamento,53.0,503500,0,estimado,Semana → Norte de Santander: alcance 53.0%
E0283,MED_04,DEP_01,alcance_medio_departamento,56.5,4068000,0,estimado,Caracol TV → Bogotá D.C.: alcance 56.5%
E0284,MED_04,DEP_02,alcance_medio_departamento,55.9,2683200,0,estimado,Caracol TV → Antioquia: alcance 55.9%
E0285,MED_04,DEP_03,alcance_medio_departamento,70.1,2173099,0,estimado,Caracol TV → Valle del Cauca: alcance 70.1%
E0286,MED_04,DEP_04,alcance_medio_departamento,65.4,1131059,0,estimado,Caracol TV → Atlántico: alcance 65.4%
E0287,MED_04,DEP_05,alcance_medio_departamento,48.3,869400,0,estimado,Caracol TV → Cundinamarca: alcance 48.3%
E0288,MED_04,DEP_06,alcance_medio_departamento,61.4,933280,0,estimado,Caracol TV → Santander: alcance 61.4%
E0289,MED_04,DEP_07,alcance_medio_departamento,54.1,811500,0,estimado,Caracol TV → Bolívar: alcance 54.1%
E0290,MED_04,DEP_08,alcance_medio_departamento,56.0,616000,0,estimado,Caracol TV → Nariño: alcance 56.0%
E0291,MED_04,DEP_09,alcance_medio_departamento,63.5,622300,0,estimado,Caracol TV → Córdoba: alcance 63.5%
E0292,MED_04,DEP_10,alcance_medio_departamento,58.0,551000,0,estimado,Caracol TV → Norte de Santander: alcance 58.0%
E0293,MED_05,DEP_01,alcance_medio_departamento,66.7,4802400,0,estimado,RCN TV → Bogotá D.C.: alcance 66.7%
E0294,MED_05,DEP_02,alcance_medio_departamento,59.4,2851200,0,estimado,RCN TV → Antioquia: alcance 59.4%
E0295,MED_05,DEP_03,alcance_medio_departamento,69.3,2148300,0,estimado,RCN TV → Valle del Cauca: alcance 69.3%
E0296,MED_05,DEP_04,alcance_medio_departamento,56.1,970220,0,estimado,RCN TV → Atlántico: alcance 56.1%
E0297,MED_05,DEP_05,alcance_medio_departamento,48.9,880200,0,estimado,RCN TV → Cundinamarca: alcance 48.9%
E0298,MED_05,DEP_06,alcance_medio_departamento,53.3,810160,0,estimado,RCN TV → Santander: alcance 53.3%
E0299,MED_05,DEP_07,alcance_medio_departamento,50.9,763500,0,estimado,RCN TV → Bolívar: alcance 50.9%
E0300,MED_05,DEP_08,alcance_medio_departamento,68.4,752400,0,estimado,RCN TV → Nariño: alcance 68.4%
`;
fs.appendFileSync(path.join(__dirname, '../public/electoral_aristas.csv'), '\n' + data);
