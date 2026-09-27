-- Reference catalogue. Example prices and observation values are omitted.
insert into public.regions (name) values
('North Africa'),
('Southern Africa'),
('West Africa'),
('East Africa'),
('Central Africa')
on conflict (name) do nothing;

insert into public.countries (slug, name, iso2, region_id, currency_code)
select v.slug, v.name, v.iso2, r.id, v.currency
from (values
('algeria', 'Algeria', 'DZ', 'North Africa', 'DZD'),
('angola', 'Angola', 'AO', 'Southern Africa', 'AOA'),
('benin', 'Benin', 'BJ', 'West Africa', 'XOF'),
('botswana', 'Botswana', 'BW', 'Southern Africa', 'BWP'),
('burkina-faso', 'Burkina Faso', 'BF', 'West Africa', 'XOF'),
('burundi', 'Burundi', 'BI', 'East Africa', 'BIF'),
('cabo-verde', 'Cabo Verde', 'CV', 'West Africa', 'CVE'),
('cameroon', 'Cameroon', 'CM', 'Central Africa', 'XAF'),
('central-african-republic', 'Central African Republic', 'CF', 'Central Africa', 'XAF'),
('chad', 'Chad', 'TD', 'Central Africa', 'XAF'),
('comoros', 'Comoros', 'KM', 'East Africa', 'KMF'),
('congo', 'Congo', 'CG', 'Central Africa', 'XAF'),
('cote-divoire', 'Côte d’Ivoire', 'CI', 'West Africa', 'XOF'),
('djibouti', 'Djibouti', 'DJ', 'East Africa', 'DJF'),
('dr-congo', 'DR Congo', 'CD', 'Central Africa', 'CDF'),
('egypt', 'Egypt', 'EG', 'North Africa', 'EGP'),
('equatorial-guinea', 'Equatorial Guinea', 'GQ', 'Central Africa', 'XAF'),
('eritrea', 'Eritrea', 'ER', 'East Africa', 'ERN'),
('eswatini', 'Eswatini', 'SZ', 'Southern Africa', 'SZL'),
('ethiopia', 'Ethiopia', 'ET', 'East Africa', 'ETB'),
('gabon', 'Gabon', 'GA', 'Central Africa', 'XAF'),
('gambia', 'Gambia', 'GM', 'West Africa', 'GMD'),
('ghana', 'Ghana', 'GH', 'West Africa', 'GHS'),
('guinea', 'Guinea', 'GN', 'West Africa', 'GNF'),
('guinea-bissau', 'Guinea-Bissau', 'GW', 'West Africa', 'XOF'),
('kenya', 'Kenya', 'KE', 'East Africa', 'KES'),
('lesotho', 'Lesotho', 'LS', 'Southern Africa', 'LSL'),
('liberia', 'Liberia', 'LR', 'West Africa', 'LRD'),
('libya', 'Libya', 'LY', 'North Africa', 'LYD'),
('madagascar', 'Madagascar', 'MG', 'East Africa', 'MGA'),
('malawi', 'Malawi', 'MW', 'Southern Africa', 'MWK'),
('mali', 'Mali', 'ML', 'West Africa', 'XOF'),
('mauritania', 'Mauritania', 'MR', 'West Africa', 'MRU'),
('mauritius', 'Mauritius', 'MU', 'East Africa', 'MUR'),
('morocco', 'Morocco', 'MA', 'North Africa', 'MAD'),
('mozambique', 'Mozambique', 'MZ', 'Southern Africa', 'MZN'),
('namibia', 'Namibia', 'NA', 'Southern Africa', 'NAD'),
('niger', 'Niger', 'NE', 'West Africa', 'XOF'),
('nigeria', 'Nigeria', 'NG', 'West Africa', 'NGN'),
('rwanda', 'Rwanda', 'RW', 'East Africa', 'RWF'),
('sao-tome-and-principe', 'São Tomé and Príncipe', 'ST', 'Central Africa', 'STN'),
('senegal', 'Senegal', 'SN', 'West Africa', 'XOF'),
('seychelles', 'Seychelles', 'SC', 'East Africa', 'SCR'),
('sierra-leone', 'Sierra Leone', 'SL', 'West Africa', 'SLE'),
('somalia', 'Somalia', 'SO', 'East Africa', 'SOS'),
('south-africa', 'South Africa', 'ZA', 'Southern Africa', 'ZAR'),
('south-sudan', 'South Sudan', 'SS', 'East Africa', 'SSP'),
('sudan', 'Sudan', 'SD', 'North Africa', 'SDG'),
('tanzania', 'Tanzania', 'TZ', 'East Africa', 'TZS'),
('togo', 'Togo', 'TG', 'West Africa', 'XOF'),
('tunisia', 'Tunisia', 'TN', 'North Africa', 'TND'),
('uganda', 'Uganda', 'UG', 'East Africa', 'UGX'),
('zambia', 'Zambia', 'ZM', 'Southern Africa', 'ZMW'),
('zimbabwe', 'Zimbabwe', 'ZW', 'Southern Africa', 'ZWG')
) as v(slug, name, iso2, region, currency)
join public.regions r on r.name = v.region
on conflict (slug) do update set name = excluded.name, iso2 = excluded.iso2, region_id = excluded.region_id, currency_code = excluded.currency_code;

insert into public.industries (slug, name)
select v.slug, v.name from (values
('banking', 'Banking & finance'),
('energy', 'Energy'),
('mining', 'Mining'),
('agriculture', 'Agriculture'),
('telecoms', 'Telecoms'),
('logistics', 'Logistics & ports'),
('infrastructure', 'Infrastructure'),
('tourism', 'Tourism'),
('consumer', 'Consumer'),
('fintech', 'Fintech'),
('insurance', 'Insurance'),
('industry', 'Industry')
) as v(slug, name)
on conflict (slug) do update set name = excluded.name;

insert into public.currencies (code, name, country_id)
select v.code, v.name, c.id
from (values
('DZD', 'Algerian dinar', 'algeria'),
('AOA', 'Angolan kwanza', 'angola'),
('XOF', 'West African CFA franc', ''),
('BWP', 'Botswana pula', 'botswana'),
('BIF', 'Burundian franc', 'burundi'),
('CVE', 'Cape Verdean escudo', 'cabo-verde'),
('XAF', 'Central African CFA franc', ''),
('KMF', 'Comorian franc', 'comoros'),
('DJF', 'Djiboutian franc', 'djibouti'),
('CDF', 'Congolese franc', 'dr-congo'),
('EGP', 'Egyptian pound', 'egypt'),
('ERN', 'Eritrean nakfa', 'eritrea'),
('SZL', 'Swazi lilangeni', 'eswatini'),
('ETB', 'Ethiopian birr', 'ethiopia'),
('GMD', 'Gambian dalasi', 'gambia'),
('GHS', 'Ghanaian cedi', 'ghana'),
('GNF', 'Guinean franc', 'guinea'),
('KES', 'Kenyan shilling', 'kenya'),
('LSL', 'Lesotho loti', 'lesotho'),
('LRD', 'Liberian dollar', 'liberia'),
('LYD', 'Libyan dinar', 'libya'),
('MGA', 'Malagasy ariary', 'madagascar'),
('MWK', 'Malawian kwacha', 'malawi'),
('MRU', 'Mauritanian ouguiya', 'mauritania'),
('MUR', 'Mauritian rupee', 'mauritius'),
('MAD', 'Moroccan dirham', 'morocco'),
('MZN', 'Mozambican metical', 'mozambique'),
('NAD', 'Namibian dollar', 'namibia'),
('NGN', 'Nigerian naira', 'nigeria'),
('RWF', 'Rwandan franc', 'rwanda'),
('STN', 'São Tomé and Príncipe dobra', 'sao-tome-and-principe'),
('SCR', 'Seychellois rupee', 'seychelles'),
('SLE', 'Sierra Leonean leone', 'sierra-leone'),
('SOS', 'Somali shilling', 'somalia'),
('ZAR', 'South African rand', 'south-africa'),
('SSP', 'South Sudanese pound', 'south-sudan'),
('SDG', 'Sudanese pound', 'sudan'),
('TZS', 'Tanzanian shilling', 'tanzania'),
('TND', 'Tunisian dinar', 'tunisia'),
('UGX', 'Ugandan shilling', 'uganda'),
('ZMW', 'Zambian kwacha', 'zambia'),
('ZWG', 'Zimbabwe Gold', 'zimbabwe')
) as v(code, name, country)
left join public.countries c on c.slug = v.country and v.country <> ''
on conflict (code) do update set name = excluded.name, country_id = excluded.country_id;

insert into public.publishers (name, homepage, kind)
select v.name, v.homepage, v.kind from (values
('Central Bank of Kenya', 'https://www.centralbank.go.ke/', 'central-bank'),
('Nairobi Securities Exchange', 'https://www.nse.co.ke/', 'exchange'),
('Central Bank of Nigeria', 'https://www.cbn.gov.ng/', 'central-bank'),
('Nigerian Exchange Group', 'https://ngxgroup.com/', 'exchange'),
('South African Reserve Bank', 'https://www.resbank.co.za/', 'central-bank'),
('Johannesburg Stock Exchange', 'https://www.jse.co.za/', 'exchange'),
('Central Bank of Egypt', 'https://www.cbe.org.eg/', 'central-bank'),
('Egyptian Exchange', 'https://www.egx.com.eg/', 'exchange'),
('Bank of Ghana', 'https://www.bog.gov.gh/', 'central-bank'),
('Ghana Stock Exchange', 'https://gse.com.gh/', 'exchange'),
('National Bank of Rwanda', 'https://www.bnr.rw/', 'central-bank'),
('Bank of Uganda', 'https://www.bou.or.ug/', 'central-bank'),
('Bank of Tanzania', 'https://www.bot.go.tz/', 'central-bank'),
('National Bank of Ethiopia', 'https://nbe.gov.et/', 'central-bank'),
('Bank Al-Maghrib', 'https://www.bkam.ma/', 'central-bank'),
('BCEAO', 'https://www.bceao.int/', 'central-bank'),
('African Development Bank', 'https://www.afdb.org/', 'dfi'),
('Kenya National Bureau of Statistics', 'https://www.knbs.or.ke/', 'stats')
) as v(name, homepage, kind)
on conflict (name) do update set homepage = excluded.homepage, kind = excluded.kind;

insert into public.sources (publisher, url, confidence, methodology)
select v.publisher, v.url, 'unverified', v.note
from (values
('Central Bank of Kenya', 'https://www.centralbank.go.ke/', 'Policy rate and FX window. Source of record for Kenya tape.'),
('Nairobi Securities Exchange', 'https://www.nse.co.ke/', 'Official issuer window. Afronomics does not mirror the tape.'),
('Central Bank of Nigeria', 'https://www.cbn.gov.ng/', 'MPC and FX circulars. Prints stay blank until cited.'),
('Nigerian Exchange Group', 'https://ngxgroup.com/', 'Issuer notices only through the official door.'),
('South African Reserve Bank', 'https://www.resbank.co.za/', 'Monetary policy and banking supervision door.'),
('Johannesburg Stock Exchange', 'https://www.jse.co.za/', 'Listed issuer window.'),
('Central Bank of Egypt', 'https://www.cbe.org.eg/', 'Policy and FX door for Egypt desk.'),
('Egyptian Exchange', 'https://www.egx.com.eg/', 'EGX 30 and issuer notices.'),
('Bank of Ghana', 'https://www.bog.gov.gh/', 'GHS and MPC door.'),
('Ghana Stock Exchange', 'https://gse.com.gh/', 'GSE CI and issuer window.'),
('National Bank of Rwanda', 'https://www.bnr.rw/', 'RWF and supervision door.'),
('Bank of Uganda', 'https://www.bou.or.ug/', 'UGX and MPC door for Uganda desk.'),
('Bank of Tanzania', 'https://www.bot.go.tz/', 'TZS and supervision door for Tanzania desk.'),
('National Bank of Ethiopia', 'https://nbe.gov.et/', 'ETB door for Ethiopia desk. FX cells stay blank until cited.'),
('Bank Al-Maghrib', 'https://www.bkam.ma/', 'MAD door for Morocco desk.'),
('BCEAO', 'https://www.bceao.int/', 'XOF door for WAEMU desks. Côte d’Ivoire file points here.'),
('African Development Bank', 'https://www.afdb.org/', 'Climate and capital books cite AfDB only after a project ticket is filed.'),
('Kenya National Bureau of Statistics', 'https://www.knbs.or.ke/', 'Macro series slots. No modelled headline GDP.')
) as v(publisher, url, note)
where not exists (select 1 from public.sources s where s.url = v.url);

insert into public.exchanges (slug, name, country_id, homepage)
select v.slug, v.name, c.id, v.homepage
from (values
('nse-20', 'NSE 20', 'kenya', 'https://www.nse.co.ke/'),
('ngx-asi', 'NGX ASI', 'nigeria', 'https://ngxgroup.com/'),
('jse-alsi', 'JSE ALSI', 'south-africa', 'https://www.jse.co.za/'),
('gse-ci', 'GSE CI', 'ghana', 'https://gse.com.gh/'),
('egx-30', 'EGX 30', 'egypt', 'https://www.egx.com.eg/')
) as v(slug, name, country, homepage)
join public.countries c on c.slug = v.country
on conflict (slug) do update set name = excluded.name, country_id = excluded.country_id, homepage = excluded.homepage;

insert into public.economic_indicators (slug, name, unit, frequency)
select v.slug, v.name, v.unit, null from (values
('inflation', 'Inflation', 'percent, period as published'),
('gdp', 'Gross domestic product', 'as published'),
('policy-rate', 'Policy interest rate', 'percent'),
('public-debt', 'Public debt', 'as published'),
('fdi', 'Foreign direct investment', 'as published')
) as v(slug, name, unit)
on conflict (slug) do update set name = excluded.name, unit = excluded.unit;

insert into public.companies (slug, name, country_id, industry_id, listed, exchange_id, website)
select v.slug, v.name, c.id, i.id, true, e.id, nullif(v.website, '')
from (values
('safaricom', 'Safaricom', 'kenya', 'telecoms', 'nse-20', 'https://www.nse.co.ke/'),
('equity-group', 'Equity Group', 'kenya', 'banking', 'nse-20', 'https://www.nse.co.ke/'),
('kcb-group', 'KCB Group', 'kenya', 'banking', 'nse-20', 'https://www.nse.co.ke/'),
('mtn-nigeria', 'MTN Nigeria', 'nigeria', 'telecoms', 'ngx-asi', 'https://ngxgroup.com/'),
('standard-bank', 'Standard Bank Group', 'south-africa', 'banking', 'jse-alsi', 'https://www.jse.co.za/')
) as v(slug, name, country, industry, exchange, website)
join public.countries c on c.slug = v.country
left join public.industries i on i.slug = v.industry and v.industry <> ''
left join public.exchanges e on e.slug = v.exchange and v.exchange <> ''
on conflict (slug) do update set name = excluded.name, country_id = excluded.country_id, industry_id = excluded.industry_id, listed = excluded.listed, exchange_id = excluded.exchange_id, website = excluded.website;

insert into public.newsletters (slug, name)
select v.slug, v.name from (values
('morning-teaser', 'Morning brief teaser'),
('pro-digest', 'Pro desk digest'),
('weekly-file', 'Weekly file'),
('signal-alert', 'Signal alert mail'),
('enterprise-pack', 'Enterprise pack mail')
) as v(slug, name)
on conflict (slug) do update set name = excluded.name;

insert into public.infrastructure_projects (slug, name, country_id, corridor)
select v.slug, v.name, c.id, v.geography
from (values
('northern-corridor', 'Northern Corridor', '', 'Mombasa — Nairobi — Kampala — Kigali — Bujumbura / South Sudan'),
('central-corridor', 'Central Corridor', '', 'Dar es Salaam — Dodoma — Kigali / Bujumbura / DRC'),
('lobito-corridor', 'Lobito Corridor', '', 'Lobito — DRC Copperbelt — Zambia'),
('maputo-corridor', 'Maputo Corridor', '', 'Maputo — Mpumalanga — Gauteng'),
('trans-kalahari', 'Trans-Kalahari Corridor', '', 'Walvis Bay — Windhoek — Gaborone — Johannesburg'),
('beira-corridor', 'Beira Corridor', '', 'Beira — Harare hinterland'),
('abidjan-lagos', 'Abidjan–Lagos Corridor', '', 'Abidjan — Tema — Lomé — Cotonou — Lagos'),
('nacala-corridor', 'Nacala Corridor', '', 'Nacala — Lilongwe — Lusaka'),
('lapsset', 'LAPSSET Corridor', '', 'Lamu — South Sudan — Addis Ababa'),
('north-south-corridor', 'North-South Corridor', '', 'Durban — Harare — Lusaka — Dar es Salaam'),
('douala-ndjamena', 'Douala–N''Djamena Corridor', '', 'Douala — N’Djamena'),
('walvis-ndola', 'Walvis Bay–Ndola Corridor', '', 'Walvis Bay — Lusaka — Ndola'),
('djibouti-addis', 'Djibouti–Addis Corridor', '', 'Djibouti — Addis Ababa'),
('dakar-bamako', 'Dakar–Bamako Corridor', '', 'Dakar — Bamako'),
('cotonou-niamey', 'Cotonou–Niamey Corridor', '', 'Cotonou — Niamey'),
('lome-ouagadougou', 'Lomé–Ouagadougou Corridor', '', 'Lomé — Ouagadougou'),
('abidjan-ouagadougou', 'Abidjan–Ouagadougou Corridor', '', 'Abidjan — Ouagadougou'),
('conakry-bamako', 'Conakry–Bamako Corridor', '', 'Conakry — Bamako'),
('pointe-noire-brazzaville', 'Pointe-Noire–Brazzaville Corridor', 'congo', 'Pointe-Noire — Brazzaville'),
('tazara', 'TAZARA', '', 'Dar es Salaam — Lusaka'),
('douala-bangui', 'Douala–Bangui Corridor', '', 'Douala — Bangui'),
('tema-ouagadougou', 'Tema–Ouagadougou Corridor', '', 'Tema — Ouagadougou'),
('abidjan-bamako', 'Abidjan–Bamako Corridor', '', 'Abidjan — Bamako'),
('lome-niamey', 'Lomé–Niamey Corridor', '', 'Lomé — Niamey'),
('nouakchott-dakar', 'Nouakchott–Dakar Corridor', '', 'Nouakchott — Dakar'),
('lagos-niamey', 'Lagos–Niamey Corridor', '', 'Lagos — Niamey'),
('matadi-kinshasa', 'Matadi–Kinshasa Corridor', 'dr-congo', 'Matadi — Kinshasa'),
('berbera-addis', 'Berbera–Addis Corridor', '', 'Berbera — Addis Ababa'),
('cape-town-johannesburg', 'Cape Town–Johannesburg Corridor', 'south-africa', 'Cape Town — Johannesburg'),
('alexandria-cairo', 'Alexandria–Cairo Corridor', 'egypt', 'Alexandria — Cairo'),
('port-said-cairo', 'Port Said–Cairo Corridor', 'egypt', 'Port Said — Cairo'),
('banjul-dakar', 'Banjul–Dakar Corridor', '', 'Banjul — Dakar'),
('freetown-monrovia', 'Freetown–Monrovia Corridor', '', 'Freetown — Monrovia'),
('luanda-lobito', 'Luanda–Lobito Corridor', 'angola', 'Luanda — Lobito'),
('port-sudan-khartoum', 'Port Sudan–Khartoum Corridor', 'sudan', 'Port Sudan — Khartoum'),
('toamasina-antananarivo', 'Toamasina–Antananarivo Corridor', 'madagascar', 'Toamasina — Antananarivo'),
('mbabane-maputo', 'Mbabane–Maputo Corridor', '', 'Mbabane — Maputo'),
('maseru-johannesburg', 'Maseru–Johannesburg Corridor', '', 'Maseru — Johannesburg'),
('bissau-dakar', 'Bissau–Dakar Corridor', '', 'Bissau — Dakar'),
('mogadishu-berbera', 'Mogadishu–Berbera Corridor', 'somalia', 'Mogadishu — Berbera'),
('accra-tema', 'Accra–Tema Corridor', 'ghana', 'Accra — Tema'),
('abuja-lagos', 'Abuja–Lagos Corridor', 'nigeria', 'Abuja — Lagos'),
('douala-yaounde', 'Douala–Yaoundé Corridor', 'cameroon', 'Douala — Yaoundé'),
('massawa-asmara', 'Massawa–Asmara Corridor', 'eritrea', 'Massawa — Asmara'),
('tangier-casablanca', 'Tangier–Casablanca Corridor', 'morocco', 'Tangier — Casablanca'),
('tunis-sfax', 'Tunis–Sfax Corridor', 'tunisia', 'Tunis — Sfax'),
('algiers-oran', 'Algiers–Oran Corridor', 'algeria', 'Algiers — Oran'),
('tripoli-benghazi', 'Tripoli–Benghazi Corridor', 'libya', 'Tripoli — Benghazi'),
('libreville-port-gentil', 'Libreville–Port-Gentil Corridor', 'gabon', 'Libreville — Port-Gentil'),
('malabo-bata', 'Malabo–Bata Corridor', 'equatorial-guinea', 'Malabo — Bata'),
('nouakchott-nouadhibou', 'Nouakchott–Nouadhibou Corridor', 'mauritania', 'Nouakchott — Nouadhibou'),
('lusaka-ndola', 'Lusaka–Ndola Corridor', 'zambia', 'Lusaka — Ndola'),
('beira-lilongwe', 'Beira–Lilongwe Corridor', '', 'Beira — Lilongwe'),
('harare-bulawayo', 'Harare–Bulawayo Corridor', 'zimbabwe', 'Harare — Bulawayo'),
('accra-kumasi', 'Accra–Kumasi Corridor', 'ghana', 'Accra — Kumasi'),
('brazzaville-kinshasa', 'Brazzaville–Kinshasa Corridor', '', 'Brazzaville — Kinshasa'),
('gaborone-francistown', 'Gaborone–Francistown Corridor', 'botswana', 'Gaborone — Francistown'),
('windhoek-walvis-bay', 'Windhoek–Walvis Bay Corridor', 'namibia', 'Windhoek — Walvis Bay'),
('mombasa-nairobi', 'Mombasa–Nairobi Corridor', 'kenya', 'Mombasa — Nairobi'),
('dar-es-salaam-dodoma', 'Dar es Salaam–Dodoma Corridor', 'tanzania', 'Dar es Salaam — Dodoma'),
('kano-lagos', 'Kano–Lagos Corridor', 'nigeria', 'Kano — Lagos'),
('blantyre-lilongwe', 'Blantyre–Lilongwe Corridor', 'malawi', 'Blantyre — Lilongwe'),
('cairo-aswan', 'Cairo–Aswan Corridor', 'egypt', 'Cairo — Aswan'),
('casablanca-marrakech', 'Casablanca–Marrakech Corridor', 'morocco', 'Casablanca — Marrakech'),
('durban-johannesburg', 'Durban–Johannesburg Corridor', 'south-africa', 'Durban — Johannesburg'),
('kampala-kigali', 'Kampala–Kigali Corridor', '', 'Kampala — Kigali'),
('juba-kampala', 'Juba–Kampala Corridor', '', 'Juba — Kampala'),
('ouagadougou-niamey', 'Ouagadougou–Niamey Corridor', '', 'Ouagadougou — Niamey'),
('addis-ababa-nairobi', 'Addis Ababa–Nairobi Corridor', '', 'Addis Ababa — Nairobi'),
('bamako-ouagadougou', 'Bamako–Ouagadougou Corridor', '', 'Bamako — Ouagadougou'),
('niamey-kano', 'Niamey–Kano Corridor', '', 'Niamey — Kano'),
('algiers-constantine', 'Algiers–Constantine Corridor', 'algeria', 'Algiers — Constantine'),
('accra-takoradi', 'Accra–Takoradi Corridor', 'ghana', 'Accra — Takoradi'),
('kigali-bujumbura', 'Kigali–Bujumbura Corridor', '', 'Kigali — Bujumbura'),
('lusaka-harare', 'Lusaka–Harare Corridor', '', 'Lusaka — Harare'),
('lagos-port-harcourt', 'Lagos–Port Harcourt Corridor', 'nigeria', 'Lagos — Port Harcourt'),
('nairobi-kisumu', 'Nairobi–Kisumu Corridor', 'kenya', 'Nairobi — Kisumu'),
('abidjan-san-pedro', 'Abidjan–San-Pédro Corridor', 'cote-divoire', 'Abidjan — San-Pédro'),
('beira-tete', 'Beira–Tete Corridor', 'mozambique', 'Beira — Tete'),
('monrovia-buchanan', 'Monrovia–Buchanan Corridor', 'liberia', 'Monrovia — Buchanan'),
('casablanca-rabat', 'Casablanca–Rabat Corridor', 'morocco', 'Casablanca — Rabat'),
('johannesburg-pretoria', 'Johannesburg–Pretoria Corridor', 'south-africa', 'Johannesburg — Pretoria'),
('dakar-saint-louis', 'Dakar–Saint-Louis Corridor', 'senegal', 'Dakar — Saint-Louis'),
('accra-tamale', 'Accra–Tamale Corridor', 'ghana', 'Accra — Tamale'),
('luanda-namibe', 'Luanda–Namibe Corridor', 'angola', 'Luanda — Namibe'),
('kinshasa-lubumbashi', 'Kinshasa–Lubumbashi Corridor', 'dr-congo', 'Kinshasa — Lubumbashi'),
('algiers-annaba', 'Algiers–Annaba Corridor', 'algeria', 'Algiers — Annaba'),
('lagos-calabar', 'Lagos–Calabar Corridor', 'nigeria', 'Lagos — Calabar'),
('kampala-entebbe', 'Kampala–Entebbe Corridor', 'uganda', 'Kampala — Entebbe'),
('dar-es-salaam-mwanza', 'Dar es Salaam–Mwanza Corridor', 'tanzania', 'Dar es Salaam — Mwanza'),
('cotonou-porto-novo', 'Cotonou–Porto-Novo Corridor', 'benin', 'Cotonou — Porto-Novo'),
('lome-kara', 'Lomé–Kara Corridor', 'togo', 'Lomé — Kara'),
('tunis-sousse', 'Tunis–Sousse Corridor', 'tunisia', 'Tunis — Sousse'),
('cairo-luxor', 'Cairo–Luxor Corridor', 'egypt', 'Cairo — Luxor'),
('conakry-kankan', 'Conakry–Kankan Corridor', 'guinea', 'Conakry — Kankan'),
('libreville-franceville', 'Libreville–Franceville Corridor', 'gabon', 'Libreville — Franceville'),
('nairobi-nakuru', 'Nairobi–Nakuru Corridor', 'kenya', 'Nairobi — Nakuru'),
('addis-ababa-dire-dawa', 'Addis Ababa–Dire Dawa Corridor', 'ethiopia', 'Addis Ababa — Dire Dawa'),
('abidjan-bouake', 'Abidjan–Bouaké Corridor', 'cote-divoire', 'Abidjan — Bouaké'),
('lagos-ibadan', 'Lagos–Ibadan Corridor', 'nigeria', 'Lagos — Ibadan'),
('johannesburg-bloemfontein', 'Johannesburg–Bloemfontein Corridor', 'south-africa', 'Johannesburg — Bloemfontein'),
('lusaka-livingstone', 'Lusaka–Livingstone Corridor', 'zambia', 'Lusaka — Livingstone'),
('marrakech-agadir', 'Marrakech–Agadir Corridor', 'morocco', 'Marrakech — Agadir'),
('kampala-jinja', 'Kampala–Jinja Corridor', 'uganda', 'Kampala — Jinja'),
('yaounde-garoua', 'Yaoundé–Garoua Corridor', 'cameroon', 'Yaoundé — Garoua'),
('harare-mutare', 'Harare–Mutare Corridor', 'zimbabwe', 'Harare — Mutare'),
('maputo-nampula', 'Maputo–Nampula Corridor', 'mozambique', 'Maputo — Nampula'),
('accra-cape-coast', 'Accra–Cape Coast Corridor', 'ghana', 'Accra — Cape Coast'),
('windhoek-rundu', 'Windhoek–Rundu Corridor', 'namibia', 'Windhoek — Rundu'),
('gaborone-maun', 'Gaborone–Maun Corridor', 'botswana', 'Gaborone — Maun'),
('tripoli-misrata', 'Tripoli–Misrata Corridor', 'libya', 'Tripoli — Misrata'),
('oran-constantine', 'Oran–Constantine Corridor', 'algeria', 'Oran — Constantine'),
('blantyre-zomba', 'Blantyre–Zomba Corridor', 'malawi', 'Blantyre — Zomba'),
('asmara-keren', 'Asmara–Keren Corridor', 'eritrea', 'Asmara — Keren'),
('luanda-malanje', 'Luanda–Malanje Corridor', 'angola', 'Luanda — Malanje'),
('antananarivo-fianarantsoa', 'Antananarivo–Fianarantsoa Corridor', 'madagascar', 'Antananarivo — Fianarantsoa')
) as v(slug, name, country, geography)
left join public.countries c on c.slug = v.country and v.country <> ''
where not exists (select 1 from public.infrastructure_projects p where p.slug = v.slug);

insert into public.signals (title, country_id, sector, category, direction, confidence, severity, time_horizon, fact, interpretation)
select v.title, c.id, v.sector, v.category, v.direction, v.confidence, v.severity, v.horizon, v.fact, v.interpretation
from (values
('Policy — electricity tariff file (Kenya)', 'kenya', 'Energy', 'Policy', 'Watch', 'Low — methodology', 'Desk file', 'Near term', 'A tariff decision, if published, is a primary document — not a score.', 'Connect any official notice to inflation, manufacturing costs, FX, listed utilities, and household demand. Do not invent the print.'),
('Capital — DFI climate book (regional)', '', 'Climate', 'Climate', 'Watch', 'Low — methodology', 'Desk file', 'Medium', 'No production climate-capital series is connected.', 'The Climate Capital page is the scaffold. Numbers stay blank until sourced.'),
('Debt — T-bill result notice (Kenya)', 'kenya', 'Sovereign', 'Debt', 'Watch', 'Low — methodology', 'Desk file', 'Near term', 'The result notice is the only official print. Until it is up, the desk holds a blank.', 'Chat yields are not prints. File the offered, bids, accepted amount and WAR as the Bank publishes them.')
) as v(title, country, sector, category, direction, confidence, severity, horizon, fact, interpretation)
left join public.countries c on c.slug = v.country and v.country <> ''
where not exists (select 1 from public.signals s where s.title = v.title);
