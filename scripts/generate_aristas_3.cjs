const fs = require('fs');
const path = require('path');

const data = `E0301,MED_05,DEP_09,alcance_medio_departamento,54.4,533120,0,estimado,RCN TV → Córdoba: alcance 54.4%
E0302,MED_05,DEP_10,alcance_medio_departamento,48.4,459800,0,estimado,RCN TV → Norte de Santander: alcance 48.4%
E0303,MED_06,DEP_01,alcance_medio_departamento,53.0,3816000,0,estimado,Blu Radio → Bogotá D.C.: alcance 53.0%
E0304,MED_06,DEP_02,alcance_medio_departamento,59.0,2832000,0,estimado,Blu Radio → Antioquia: alcance 59.0%
E0305,MED_06,DEP_03,alcance_medio_departamento,54.6,1692600,0,estimado,Blu Radio → Valle del Cauca: alcance 54.6%
E0306,MED_06,DEP_04,alcance_medio_departamento,63.1,1091282,0,estimado,Blu Radio → Atlántico: alcance 63.1%
E0307,MED_06,DEP_05,alcance_medio_departamento,49.9,898200,0,estimado,Blu Radio → Cundinamarca: alcance 49.9%
E0308,MED_06,DEP_06,alcance_medio_departamento,64.6,981919,0,estimado,Blu Radio → Santander: alcance 64.6%
E0309,MED_06,DEP_07,alcance_medio_departamento,60.9,913500,0,estimado,Blu Radio → Bolívar: alcance 60.9%
E0310,MED_06,DEP_08,alcance_medio_departamento,48.3,531300,0,estimado,Blu Radio → Nariño: alcance 48.3%
E0311,MED_06,DEP_09,alcance_medio_departamento,50.3,492940,0,estimado,Blu Radio → Córdoba: alcance 50.3%
E0312,MED_06,DEP_10,alcance_medio_departamento,55.9,531050,0,estimado,Blu Radio → Norte de Santander: alcance 55.9%
E0313,MED_07,DEP_01,alcance_medio_departamento,53.3,3837600,0,estimado,Las2Orillas → Bogotá D.C.: alcance 53.3%
E0314,MED_07,DEP_02,alcance_medio_departamento,59.1,2836800,0,estimado,Las2Orillas → Antioquia: alcance 59.1%
E0315,MED_07,DEP_03,alcance_medio_departamento,62.5,1937500,0,estimado,Las2Orillas → Valle del Cauca: alcance 62.5%
E0316,MED_07,DEP_04,alcance_medio_departamento,52.1,901042,0,estimado,Las2Orillas → Atlántico: alcance 52.1%
E0317,MED_07,DEP_05,alcance_medio_departamento,55.4,997200,0,estimado,Las2Orillas → Cundinamarca: alcance 55.4%
E0318,MED_07,DEP_06,alcance_medio_departamento,61.6,936320,0,estimado,Las2Orillas → Santander: alcance 61.6%
E0319,MED_07,DEP_07,alcance_medio_departamento,65.1,976499,0,estimado,Las2Orillas → Bolívar: alcance 65.1%
E0320,MED_07,DEP_08,alcance_medio_departamento,64.3,707300,0,estimado,Las2Orillas → Nariño: alcance 64.3%
E0321,MED_07,DEP_09,alcance_medio_departamento,61.4,601720,0,estimado,Las2Orillas → Córdoba: alcance 61.4%
E0322,MED_07,DEP_10,alcance_medio_departamento,50.6,480700,0,estimado,Las2Orillas → Norte de Santander: alcance 50.6%
E0323,MED_08,DEP_01,alcance_medio_departamento,54.5,3924000,0,estimado,TikTok_Colombia → Bogotá D.C.: alcance 54.5%
E0324,MED_08,DEP_02,alcance_medio_departamento,58.1,2788800,0,estimado,TikTok_Colombia → Antioquia: alcance 58.1%
E0325,MED_08,DEP_03,alcance_medio_departamento,52.4,1624400,0,estimado,TikTok_Colombia → Valle del Cauca: alcance 52.4%
E0326,MED_08,DEP_04,alcance_medio_departamento,65.6,1134518,0,estimado,TikTok_Colombia → Atlántico: alcance 65.6%
E0327,MED_08,DEP_05,alcance_medio_departamento,71.7,1290600,0,estimado,TikTok_Colombia → Cundinamarca: alcance 71.7%
E0328,MED_08,DEP_06,alcance_medio_departamento,71.7,1089840,0,estimado,TikTok_Colombia → Santander: alcance 71.7%
E0329,MED_08,DEP_07,alcance_medio_departamento,69.9,1048500,0,estimado,TikTok_Colombia → Bolívar: alcance 69.9%
E0330,MED_08,DEP_08,alcance_medio_departamento,63.8,701800,0,estimado,TikTok_Colombia → Nariño: alcance 63.8%
E0331,MED_08,DEP_09,alcance_medio_departamento,56.2,550760,0,estimado,TikTok_Colombia → Córdoba: alcance 56.2%
E0332,MED_08,DEP_10,alcance_medio_departamento,56.3,534850,0,estimado,TikTok_Colombia → Norte de Santander: alcance 56.3%
E0333,FRA_01,CAN_01,afinidad_franja_candidato,30.9,2296387,0,encuesta_simulada_DANE,18-25 años → Paloma Valencia: afinidad 30.9%
E0334,FRA_01,CAN_02,afinidad_franja_candidato,76.0,5648073,1,encuesta_simulada_DANE,18-25 años → Iván Cepeda: afinidad 76.0%
E0335,FRA_01,CAN_03,afinidad_franja_candidato,58.1,4317803,0,encuesta_simulada_DANE,18-25 años → Claudia López: afinidad 58.1%
E0336,FRA_01,CAN_04,afinidad_franja_candidato,80.7,5997361,1,encuesta_simulada_DANE,18-25 años → Roy Barreras: afinidad 80.7%
E0337,FRA_01,CAN_05,afinidad_franja_candidato,26.3,1954530,0,encuesta_simulada_DANE,18-25 años → Juan Daniel Oviedo: afinidad 26.3%
E0338,FRA_01,CAN_06,afinidad_franja_candidato,54.9,4079989,0,encuesta_simulada_DANE,18-25 años → Sergio Fajardo: afinidad 54.9%
E0339,FRA_02,CAN_01,afinidad_franja_candidato,44.2,5109689,0,encuesta_simulada_DANE,26-40 años → Paloma Valencia: afinidad 44.2%
E0340,FRA_02,CAN_02,afinidad_franja_candidato,52.5,6069201,0,encuesta_simulada_DANE,26-40 años → Iván Cepeda: afinidad 52.5%
E0341,FRA_02,CAN_03,afinidad_franja_candidato,58.0,6705022,1,encuesta_simulada_DANE,26-40 años → Claudia López: afinidad 58.0%
E0342,FRA_02,CAN_04,afinidad_franja_candidato,52.0,6011399,0,encuesta_simulada_DANE,26-40 años → Roy Barreras: afinidad 52.0%
E0343,FRA_02,CAN_05,afinidad_franja_candidato,45.6,5271534,0,encuesta_simulada_DANE,26-40 años → Juan Daniel Oviedo: afinidad 45.6%
E0344,FRA_02,CAN_06,afinidad_franja_candidato,58.2,6728143,1,encuesta_simulada_DANE,26-40 años → Sergio Fajardo: afinidad 58.2%
E0345,FRA_03,CAN_01,afinidad_franja_candidato,64.7,8548077,1,encuesta_simulada_DANE,41-60 años → Paloma Valencia: afinidad 64.7%
E0346,FRA_03,CAN_02,afinidad_franja_candidato,37.2,4914814,0,encuesta_simulada_DANE,41-60 años → Iván Cepeda: afinidad 37.2%
E0347,FRA_03,CAN_03,afinidad_franja_candidato,47.7,6302060,0,encuesta_simulada_DANE,41-60 años → Claudia López: afinidad 47.7%
E0348,FRA_03,CAN_04,afinidad_franja_candidato,34.4,4544882,0,encuesta_simulada_DANE,41-60 años → Roy Barreras: afinidad 34.4%
E0349,FRA_03,CAN_05,afinidad_franja_candidato,61.3,8098874,1,encuesta_simulada_DANE,41-60 años → Juan Daniel Oviedo: afinidad 61.3%
E0350,FRA_03,CAN_06,afinidad_franja_candidato,46.5,6143518,0,encuesta_simulada_DANE,41-60 años → Sergio Fajardo: afinidad 46.5%
E0351,FRA_04,CAN_01,afinidad_franja_candidato,69.8,6340044,1,encuesta_simulada_DANE,61+ años → Paloma Valencia: afinidad 69.8%
E0352,FRA_04,CAN_02,afinidad_franja_candidato,31.3,2843028,0,encuesta_simulada_DANE,61+ años → Iván Cepeda: afinidad 31.3%
E0353,FRA_04,CAN_03,afinidad_franja_candidato,43.5,3951173,0,encuesta_simulada_DANE,61+ años → Claudia López: afinidad 43.5%
E0354,FRA_04,CAN_04,afinidad_franja_candidato,32.1,2915693,0,encuesta_simulada_DANE,61+ años → Roy Barreras: afinidad 32.1%
E0355,FRA_04,CAN_05,afinidad_franja_candidato,66.4,6031217,1,encuesta_simulada_DANE,61+ años → Juan Daniel Oviedo: afinidad 66.4%
E0356,FRA_04,CAN_06,afinidad_franja_candidato,41.9,3805843,0,encuesta_simulada_DANE,61+ años → Sergio Fajardo: afinidad 41.9%
E0357,FRA_05,CAN_01,afinidad_franja_candidato,28.7,5924696,0,encuesta_simulada_DANE,Estrato 1-2 → Paloma Valencia: afinidad 28.7%
E0358,FRA_05,CAN_02,afinidad_franja_candidato,72.1,14883993,1,encuesta_simulada_DANE,Estrato 1-2 → Iván Cepeda: afinidad 72.1%
E0359,FRA_05,CAN_03,afinidad_franja_candidato,48.2,9950187,0,encuesta_simulada_DANE,Estrato 1-2 → Claudia López: afinidad 48.2%
E0360,FRA_05,CAN_04,afinidad_franja_candidato,70.6,14574340,1,encuesta_simulada_DANE,Estrato 1-2 → Roy Barreras: afinidad 70.6%
E0361,FRA_05,CAN_05,afinidad_franja_candidato,30.5,6296280,0,encuesta_simulada_DANE,Estrato 1-2 → Juan Daniel Oviedo: afinidad 30.5%
E0362,FRA_05,CAN_06,afinidad_franja_candidato,46.7,9640534,0,encuesta_simulada_DANE,Estrato 1-2 → Sergio Fajardo: afinidad 46.7%
E0363,FRA_06,CAN_01,afinidad_franja_candidato,49.4,7138536,0,encuesta_simulada_DANE,Estrato 3-4 → Paloma Valencia: afinidad 49.4%
E0364,FRA_06,CAN_02,afinidad_franja_candidato,45.9,6632770,0,encuesta_simulada_DANE,Estrato 3-4 → Iván Cepeda: afinidad 45.9%
E0365,FRA_06,CAN_03,afinidad_franja_candidato,64.9,9378361,1,encuesta_simulada_DANE,Estrato 3-4 → Claudia López: afinidad 64.9%
E0366,FRA_06,CAN_04,afinidad_franja_candidato,39.4,5693488,0,encuesta_simulada_DANE,Estrato 3-4 → Roy Barreras: afinidad 39.4%
E0367,FRA_06,CAN_05,afinidad_franja_candidato,50.1,7239690,0,encuesta_simulada_DANE,Estrato 3-4 → Juan Daniel Oviedo: afinidad 50.1%
E0368,FRA_06,CAN_06,afinidad_franja_candidato,65.6,9479514,1,encuesta_simulada_DANE,Estrato 3-4 → Sergio Fajardo: afinidad 65.6%
E0369,FRA_07,CAN_01,afinidad_franja_candidato,81.0,5016380,1,encuesta_simulada_DANE,Estrato 5-6 → Paloma Valencia: afinidad 81.0%
E0370,FRA_07,CAN_02,afinidad_franja_candidato,22.2,1374859,0,encuesta_simulada_DANE,Estrato 5-6 → Iván Cepeda: afinidad 22.2%
E0371,FRA_07,CAN_03,afinidad_franja_candidato,47.1,2916932,0,encuesta_simulada_DANE,Estrato 5-6 → Claudia López: afinidad 47.1%
E0372,FRA_07,CAN_04,afinidad_franja_candidato,18.9,1170488,0,encuesta_simulada_DANE,Estrato 5-6 → Roy Barreras: afinidad 18.9%
E0373,FRA_07,CAN_05,afinidad_franja_candidato,78.9,4886326,1,encuesta_simulada_DANE,Estrato 5-6 → Juan Daniel Oviedo: afinidad 78.9%
E0374,FRA_07,CAN_06,afinidad_franja_candidato,45.7,2830229,0,encuesta_simulada_DANE,Estrato 5-6 → Sergio Fajardo: afinidad 45.7%
E0375,FRA_08,CAN_01,afinidad_franja_candidato,57.7,14293588,1,encuesta_simulada_DANE,Sin edu. superior → Paloma Valencia: afinidad 57.7%
E0376,FRA_08,CAN_02,afinidad_franja_candidato,45.7,11320918,0,encuesta_simulada_DANE,Sin edu. superior → Iván Cepeda: afinidad 45.7%
E0377,FRA_08,CAN_03,afinidad_franja_candidato,45.1,11172284,0,encuesta_simulada_DANE,Sin edu. superior → Claudia López: afinidad 45.1%
E0378,FRA_08,CAN_04,afinidad_franja_candidato,48.2,11940224,0,encuesta_simulada_DANE,Sin edu. superior → Roy Barreras: afinidad 48.2%
E0379,FRA_08,CAN_05,afinidad_franja_candidato,58.1,14392677,1,encuesta_simulada_DANE,Sin edu. superior → Juan Daniel Oviedo: afinidad 58.1%
E0380,FRA_08,CAN_06,afinidad_franja_candidato,47.3,11717274,0,encuesta_simulada_DANE,Sin edu. superior → Sergio Fajardo: afinidad 47.3%
E0381,FRA_09,CAN_01,afinidad_franja_candidato,43.2,7134408,0,encuesta_simulada_DANE,Con edu. superior → Paloma Valencia: afinidad 43.2%
E0382,FRA_09,CAN_02,afinidad_franja_candidato,55.0,9083158,0,encuesta_simulada_DANE,Con edu. superior → Iván Cepeda: afinidad 55.0%
E0383,FRA_09,CAN_03,afinidad_franja_candidato,64.9,10718127,1,encuesta_simulada_DANE,Con edu. superior → Claudia López: afinidad 64.9%
E0384,FRA_09,CAN_04,afinidad_franja_candidato,52.5,8670287,0,encuesta_simulada_DANE,Con edu. superior → Roy Barreras: afinidad 52.5%
E0385,FRA_09,CAN_05,afinidad_franja_candidato,47.7,7877575,0,encuesta_simulada_DANE,Con edu. superior → Juan Daniel Oviedo: afinidad 47.7%
E0386,FRA_09,CAN_06,afinidad_franja_candidato,63.6,10503434,1,encuesta_simulada_DANE,Con edu. superior → Sergio Fajardo: afinidad 63.6%
E0387,FRA_10,CAN_01,afinidad_franja_candidato,42.0,5202172,0,encuesta_simulada_DANE,Zona rural → Paloma Valencia: afinidad 42.0%
E0388,FRA_10,CAN_02,afinidad_franja_candidato,67.1,8311090,1,encuesta_simulada_DANE,Zona rural → Iván Cepeda: afinidad 67.1%
E0389,FRA_10,CAN_03,afinidad_franja_candidato,40.9,5065925,0,encuesta_simulada_DANE,Zona rural → Claudia López: afinidad 40.9%
E0390,FRA_10,CAN_04,afinidad_franja_candidato,68.3,8459723,1,encuesta_simulada_DANE,Zona rural → Roy Barreras: afinidad 68.3%
E0391,FRA_10,CAN_05,afinidad_franja_candidato,35.2,4359916,0,encuesta_simulada_DANE,Zona rural → Juan Daniel Oviedo: afinidad 35.2%
E0392,FRA_10,CAN_06,afinidad_franja_candidato,40.4,5003994,0,encuesta_simulada_DANE,Zona rural → Sergio Fajardo: afinidad 40.4%
E0393,FRA_11,CAN_01,afinidad_franja_candidato,55.8,16126735,0,encuesta_simulada_DANE,Zona urbana → Paloma Valencia: afinidad 55.8%
E0394,FRA_11,CAN_02,afinidad_franja_candidato,43.8,12658619,0,encuesta_simulada_DANE,Zona urbana → Iván Cepeda: afinidad 43.8%
E0395,FRA_11,CAN_03,afinidad_franja_candidato,55.1,15924428,1,encuesta_simulada_DANE,Zona urbana → Claudia López: afinidad 55.1%
E0396,FRA_11,CAN_04,afinidad_franja_candidato,44.5,12860926,0,encuesta_simulada_DANE,Zona urbana → Roy Barreras: afinidad 44.5%
E0397,FRA_11,CAN_05,afinidad_franja_candidato,53.3,15404211,0,encuesta_simulada_DANE,Zona urbana → Juan Daniel Oviedo: afinidad 53.3%
E0398,FRA_11,CAN_06,afinidad_franja_candidato,54.5,15751022,1,encuesta_simulada_DANE,Zona urbana → Sergio Fajardo: afinidad 54.5%
E0399,FRA_12,CAN_01,afinidad_franja_candidato,26.3,1628775,0,encuesta_simulada_DANE,Comunidades étnicas → Paloma Valencia: afinidad 26.3%
E0400,FRA_12,CAN_02,afinidad_franja_candidato,72.3,4477584,1,encuesta_simulada_DANE,Comunidades étnicas → Iván Cepeda: afinidad 72.3%
E0401,FRA_12,CAN_03,afinidad_franja_candidato,44.3,2743526,0,encuesta_simulada_DANE,Comunidades étnicas → Claudia López: afinidad 44.3%
E0402,FRA_12,CAN_04,afinidad_franja_candidato,79.5,4923484,1,encuesta_simulada_DANE,Comunidades étnicas → Roy Barreras: afinidad 79.5%
E0403,FRA_12,CAN_05,afinidad_franja_candidato,22.4,1387246,0,encuesta_simulada_DANE,Comunidades étnicas → Juan Daniel Oviedo: afinidad 22.4%
E0404,FRA_12,CAN_06,afinidad_franja_candidato,40.1,2483418,0,encuesta_simulada_DANE,Comunidades étnicas → Sergio Fajardo: afinidad 40.1%
`;
fs.appendFileSync(path.join(__dirname, '../public/electoral_aristas.csv'), '\n' + data);
