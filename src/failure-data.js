/* Functional failure chains for the teaching models.
 * These are engineering summaries, not a diagnosis or a model-specific FMEA.
 * A source's scope states what was verified; OEM fit, geometry and thresholds
 * still require the corresponding vehicle drawing and service information.
 */
(function () {
  'use strict';

  const sources = [
    {id:'F-ZF-OIL',title:'ZF · 变速器油位与过热',url:'https://aftermarket.zf.com/en/aftermarket-portal/whats-new/expert-blog/transmission-oil-check/',scope:'核查低油位引起摩擦及过热的通用机制；不确认本模型尺寸或具体漏点。'},
    {id:'F-SON-CLUTCH',title:'Sonnax · 离合器供油密封与施压不足',url:'https://www.sonnax.com/parts/2063-intermediate-direct-clutch-feed-seal-kit',scope:'特定变速器供油密封案例说明内泄、施压不足与打滑的关系；推广到概念活塞密封属机理总结。'},
    {id:'F-SON-RING',title:'Sonnax · 旋转供油界面的压力损失',url:'https://www.sonnax.com/tech_resources/633-seal-the-deal-how-to-prevent-comebacks-with-non-valve-body-vacuum-testing',scope:'核查轴、鼓和支承之间供油界面的内泄与压力损失；不证明所有密封环损伤均产生相同挡位故障。'},
    {id:'F-SON-ORING',title:'Sonnax · 供油管O形圈泄漏与油压',url:'https://www.sonnax.com/tech_resources/191-aw-55-50sn-join-the-club',scope:'AW55案例核查供油管O形圈泄漏与压降；其它阀体接口按通用液压原理解释。'},
    {id:'F-SKF-BEARING',title:'SKF · 密封、污染和轴承失效',url:'https://evolution.skf.com/seal-analysis-pays/',scope:'核查水尘进入、润滑污染、腐蚀及轴承寿命下降的机制；不作为轮毂故障的唯一诊断依据。'},
    {id:'F-GKN-BOOT',title:'GKN · 等速万向节防尘套技术说明',url:'https://www.gknautomotive.com/globalassets/downloads/specialist-services---workshop-portal-downloads/tpe-boots-loebro/tpe-boots-loebro---gb.pdf',scope:'核查撕裂、松脱、老化防尘套与等速接头失效的关联；声音和振动为可能表现。'},
    {id:'F-ZF-RACK',title:'ZF · 转向机防尘套与水尘防护',url:'https://aftermarket.zf.com/media/master/downloads/xzm116ien.pdf',scope:'核查防尘套配合处需防止水分和污物侵入；防尘套不等同转向机内部液压油封。'},
    {id:'F-MONROE-SHOCK',title:'Monroe · 减振器轻微油膜与实际漏油',url:'https://www.monroe.com/content/dam/marketing/North-America/monroe/servicegrams/v1n5/monroe-ride-control-servicegram-vol1-no5-english.pdf',scope:'核查正常微量油膜与大片湿润、滴油的区别；持续失液后的阻尼影响为液压工作原理总结。'},
    {id:'F-MOOG-BALL',title:'MOOG · 球铰防尘套与关节磨损',url:'https://www.moogparts.com/en-ca/parts-matter/all-about-ball-joints.html',scope:'核查防尘套损坏后水及路面污物进入导致关节磨损；不能由套体裂口直接判定球销已松脱。'},
    {id:'F-HELLA-PUMP',title:'HELLA · 冷却循环泵的泄漏与故障',url:'https://www.hella.com/techworld/en/technical/car-electronics-and-electrics/media-pump/',scope:'核查冷却液损失、污染与电动循环泵工作条件；不将湿转子电泵假设为带通用轴油封。'},
    {id:'F-HELLA-AIR',title:'HELLA · 冷却系统中的空气与过热',url:'https://www.hella.com/techworld/en/technical/car-cooling-system/rinsing-and-ventilating-cooling-system/',scope:'核查冷却回路积气会降低循环能力；各静密封漏点与症状按模型介质位置作工程推断。'},
    {id:'F-GATES-WATER',title:'Gates · 冷却水泵泄漏与失效识别',url:'https://www.gatesaustralia.com.au/~/media/files/gates-au/automotive/catalogues/cooling-system-troubleshooting-manual-ausnz-august-2020.pdf',scope:'核查水泵观察孔/安装面泄漏及冷却性能影响；新泵磨合微渗与持续泄漏需区分。'},
    {id:'F-HELLA-CAP',title:'HELLA · 膨胀罐与系统压力控制',url:'https://www.hella.com/partnerworld/au/Product-range/Thermal-Management/EC-Expansion-Tank-Coolant-80195/',scope:'核查罐体/盖无法维持压力可能降低冷却性能；橡胶密封与盖内阀机构故障须分别确认。'},
    {id:'F-FST-SHAFT',title:'Freudenberg · 旋转轴密封的功能',url:'https://www.fst.com/simmerring/index.en.html',scope:'核查轴封保持润滑介质、阻隔外界介质的用途；各摩托车接口的后果按其油腔位置推断。'},
    {id:'F-AE-VALVE',title:'Federal-Mogul · 气门与气门杆密封失效诊断',url:'https://aftermarket.federalmogulpowertrain.com.tr/wp-content/uploads/2022/05/EMEA_CAT_AE_VALVES-AND-COMPONENTS_CATAE1901_2019-2021_EN_HQ.pdf',scope:'核查气门杆密封/导管磨损与机油消耗、蓝烟及积碳关系；不把气门杆油封当作燃烧室压缩密封。'},
    {id:'F-SUBARU-INTAKE',title:'Subaru · 进气密封泄漏与混合气偏稀案例',url:'https://static.nhtsa.gov/odi/tsbs/2022/MC-10209916-0001.pdf',scope:'原厂技术通报核查进气接口非计量空气、偏稀和怠速不稳；摩托车表现仍随ECU计量方式而异。'},
    {id:'F-PARKER-STATIC',title:'Parker · O形圈静密封与失效机理手册',url:'https://www.parker.com/content/dam/Parker-com/Literature/Praedifa/Catalogs/Catalog_O-Ring-Handbook_PTD5705-EN.pdf',scope:'核查静密封、径向/端面压缩与介质隔离原理；各油腔、水腔、气路接口的后果是结合模型位置的工程推断，不是已验证的车型故障统计。'},
    {id:'F-NHTSA-FUEL',title:'NHTSA · 喷油器O形圈燃油泄漏案例',url:'https://static.nhtsa.gov/odi/rcl/2018/RCAK-18E029-2489.pdf',scope:'核查喷油器O形圈泄漏与燃油遇点火源的起火风险；该召回为特定EFI系统，并非本摩托车模型的车型证据。'},
    {id:'F-CHAMPION-IGNITION',title:'Champion · 点火连接井污染与闪络',url:'https://federalmogul-prod-65a.adobecqms.net/content/dam/marketing/North-America/catalogs/champion/pdf/champion-spark-plug.pdf',scope:'核查点火连接区域油污/尘污可能形成导电路径并闪络失火；为工业火花塞技术原理，本摩托车具体点火结构需检测确认。'}
  ];

  const entry = (kind, mechanism, impact, symptoms, sourceIds) => ({kind,mechanism,impact,symptoms,sourceIds});
  const entries = {
    'tx-front':entry('旋转轴唇形油封','前泵壳与转矩转换器轮毂之间的密封唇失去贴合，ATF沿轴端外漏。','持续失液后，供油、润滑与散热条件下降，可能出现接合迟缓和过热。','钟形壳下部油迹、停车滴油、ATF液位下降；漏点需清洁后确认。',['F-FST-SHAFT','F-ZF-OIL']),
    'tx-output':entry('旋转轴唇形油封','输出轴或法兰处的密封唇损伤，ATF由尾壳接口外漏。','持续低油位可能影响液压供油、齿轮及轴承润滑，并导致过热。','尾壳、输出法兰周围湿油或甩油；低油位后可能异响、换挡异常。',['F-ZF-OIL','F-FST-SHAFT']),
    'tx-clutch':entry('离合器活塞液压密封','活塞密封损伤，压力腔发生内泄，离合器施压不足。','压紧力及可传递扭矩下降；持续打滑可能过热并烧蚀摩擦片。','入挡延迟、换挡转速上扬或动力接续不顺；内泄未必出现壳外油迹。',['F-SON-CLUTCH']),
    'tx-ring':entry('旋转供油密封环','轴、鼓或支承处的供油密封环泄漏或串油，使相应油路压力流失。','相关离合器或锁止回路接合能力下降；受影响挡位取决于该环服务的油路。','延迟接合、换挡打滑；严重时摩擦片过热，外部通常看不到漏点。',['F-SON-RING','F-SON-CLUTCH']),
    'tx-hydraulic':entry('液压接口O形圈／静密封','阀体及供油接口的O形圈破损，产生内泄、串油或接口外漏。','执行元件压力偏离要求，可能造成换挡迟缓、打滑或换挡品质下降。','热车后换挡异常、对应回路压力不足；故障码和油迹均不是必然表现。',['F-SON-ORING']),
    'tx-pan':entry('油底壳法兰静密封垫','垫片压缩、破损或法兰失配，使ATF沿油底壳接缝外漏。','漏量持续累积后油位下降，润滑、冷却及液压供油能力可能受影响。','油底壳边缘湿润、停车油滴、ATF液位下降。',['F-ZF-OIL']),
    'ch-bearing':entry('轮毂轴承密封','密封边缘损坏后，润滑脂可能流失，水、尘和泥沙进入轴承。','润滑污染、腐蚀及滚道磨损加快，轴承转动品质和寿命下降。','随车速变化的嗡鸣、转动粗糙；进一步可能发热、轮端间隙增大。',['F-SKF-BEARING']),
    'ch-diff':entry('差速器输出轴唇形油封','半轴与差速器壳体之间失去密封，齿轮油沿输出端外漏。','持续缺油后，差速齿轮及轴承润滑不足，磨损与发热风险增加。','半轴根部油迹、滴油、齿轮油位下降；进一步可能出现啸叫。',['F-FST-SHAFT','F-SKF-BEARING']),
    'ch-cv':entry('保脂及防水防尘护套','防尘套撕裂、松脱或卡箍失效，润滑脂被甩出，水尘进入接头。','滚道和滚动接触面磨损，传动平顺性与接头寿命下降。','周围甩脂、套体裂口；磨损后可能转弯咔嗒声或加速振动。',['F-GKN-BOOT']),
    'ch-rack':entry('转向齿条防水防尘护套','波纹套破损后，水和污物侵入齿条、内拉杆关节等保护区域。','腐蚀及磨损可能使转向阻力、间隙或异响增加。防尘套不承担内部液压油封的功能。','裂口、套内水迹或锈蚀；若套内有助力油，应另查转向机内部液压密封。',['F-ZF-RACK']),
    'ch-shock':entry('减振器往复杆密封','活塞杆密封损伤造成持续漏油，可能伴随空气进入或有效油量下降。','达到一定失液程度后阻尼衰减，车身振动与轮胎贴地运动的控制能力下降。','大片湿油或滴油；可能反复弹跳、制动点头加重。轻微油膜本身不等于失效。',['F-MONROE-SHOCK']),
    'ch-ball':entry('球铰保脂及防水防尘护套','套体破损使润滑脂流失、水尘进入，球销与轴承面腐蚀磨损。','关节间隙逐渐增大，转向及定位稳定性下降；进一步损伤的程度需检查确认。','套体开裂、油脂外溢；磨损后可能颠簸异响、转向松旷。',['F-MOOG-BALL']),

    'tm-pump':entry('湿转子电泵壳体静密封O形圈','泵壳O形圈破损使冷却液沿壳体接缝外漏；本示意不假设电泵另有通用轴油封。','持续失液及回路进气可能降低循环与换热能力；泵在缺液条件下工作会进一步恶化。','泵体接缝湿痕、冷却液残留、液位下降或温度控制异常。',['F-HELLA-PUMP','F-HELLA-AIR']),
    'tm-valve':entry('热管理阀壳体静密封','阀壳O形圈或盖口密封损伤，使冷却液向壳体外泄漏。','液量下降或进气后，换热与温控能力可能降低；密封破损本身不等同阀芯卡死。','阀体周边湿痕、结晶残留、冷却液液位下降。',['F-HELLA-AIR']),
    'tm-valve-internal':entry('热管理阀内部回路密封','阀芯与座面之间失去密封，关闭回路仍可能出现旁通或串流。','流量分配偏离控制目标，加热、冷却或温度保持能力下降。','壳外未必有漏液；可能目标温度建立缓慢、温度波动，需结合阀位和流量诊断。',['F-PARKER-STATIC']),
    'tm-connector':entry('冷却液快插接口静密封','接口O形圈切伤、老化或失去压缩，冷却液沿管与座孔间隙外漏。','持续失液、回路进气可能削弱循环和换热能力。','接头周围湿痕、结晶残留、液位下降；卡扣失效须与密封件问题分别检查。',['F-HELLA-AIR']),
    'tm-exchanger':entry('换热器接口静密封','本图接口O形圈损坏时，首先考虑接口外漏；仅凭该圈破损不能断言冷却液与机油互混。','冷却液量不足可能降低换热效果。跨介质串漏需另查换热芯、隔板及实际隔离密封。','接口湿痕、液位下降或温度异常；若发现互混，应进一步确认内部失效位置。',['F-HELLA-AIR']),
    'tm-sensor':entry('冷却液传感器接口静密封','插入式传感器O形圈失效，使冷却液从传感器与壳体间隙外漏。','持续失液会影响热管理；密封损伤不能直接证明传感器电气信号已失效。','传感器根部湿痕、冷却液残留、液位下降。',['F-HELLA-AIR']),
    'tm-reservoir':entry('膨胀罐盖气液密封','盖口密封失效使系统难以保持规定压力，可能产生冷却液或蒸汽泄漏。','压力保持能力下降会降低抗沸腾余量；盖内压力/真空阀的故障需另行区分。','盖口残留、液位下降、异常排液；高温工况下可能提前沸腾。',['F-HELLA-CAP']),

    'm-cover':entry('缸盖罩及螺栓静密封','缸盖罩垫或螺栓孔密封破损，机油沿罩盖周缘或螺栓孔向外渗漏。','持续失油可能降低机油液位；漏到热表面时可产生气味或烟雾。','罩盖接缝湿油、积尘油泥、热机油味或滴油。',['F-PARKER-STATIC']),
    'm-plugwell':entry('火花塞井静密封','火花塞井密封失效，罩内机油进入火花塞管外侧的井内。','积油可能影响点火帽/线圈绝缘，引起漏电、点火不稳或失火；并非每次积油都会立即失火。','火花塞井积油、点火帽油污；进一步可能怠速抖动、失火。',['F-CHAMPION-IGNITION']),
    'm-valvestem':entry('气门杆控油密封','密封唇磨损或硬化后，过量机油沿气门杆与导管间隙进入进气道或燃烧室。','机油消耗增加，并可能形成积碳、影响排放；该油封不承担气门座的燃烧气密封。','启动或收油后出现蓝烟、机油消耗增大；需与导管和活塞环问题区分。',['F-AE-VALVE']),
    'm-drain':entry('放油螺塞静密封垫圈','垫圈破损或压紧不当，使机油沿放油孔端面外漏。','持续漏油会降低油量；严重缺油后润滑能力下降。','放油螺塞周围湿油、停车滴油、机油液位下降。',['F-PARKER-STATIC']),
    'm-filler':entry('机油加注盖静密封O形圈','加注盖O形圈失去密封，机油飞溅或油雾从盖口逸出。','持续外漏会损失机油并污染机体；影响大小取决于漏量。','加注盖周围湿油、油雾残留或机油味。',['F-PARKER-STATIC']),
    'm-water-oil':entry('水泵机油侧轴油封','机油侧唇形油封失效，机油可进入两道密封之间的观察通道并从观察孔排出。','持续失油后可能影响发动机润滑；单独这道油封破损不等于冷却液立即与机油互混。','水泵观察孔附近机油湿痕或滴油，需确认液体类型及通道是否畅通。',['F-FST-SHAFT','F-GATES-WATER']),
    'm-water-mechanical':entry('水泵冷却液侧机械端面及辅助密封','端面摩擦副或辅助橡胶密封失效，冷却液可进入双密封之间的观察通道。','通常先从观察孔向外泄漏；持续失液会降低冷却能力。水油互混需结合另一道密封及通道状态确认。','观察孔冷却液湿痕、结晶或持续滴漏；新泵磨合期微渗需按原厂要求判断。',['F-GATES-WATER','F-HELLA-AIR']),
    'm-water-cover':entry('水泵泵盖冷却液静密封','泵盖O形圈破损使冷却液沿盖与泵体的结合面外漏。','持续失液或进气后可能降低冷却液循环和散热能力。','水泵盖周缘湿痕、结晶残留、冷却液液位下降。',['F-GATES-WATER','F-HELLA-AIR']),
    'm-water-housing':entry('水泵壳体安装口静密封','泵体与发动机箱体的安装O形圈失效，所在油腔或水腔介质可能沿安装口泄漏，介质须按车型确定。','油侧持续失液影响润滑；水侧持续失液影响冷却。不能仅由安装圈破损判断水油互混。','泵体安装根部湿痕；通过液体性质和原厂流道确认油侧或水侧。',['F-PARKER-STATIC','F-GATES-WATER']),
    'm-pickup':entry('机油泵吸入侧接头密封','吸油管接口失去密封，在吸油负压下可能吸入空气。','机油供给可能含气或流量不足，导致油压不稳、润滑不足；外侧未必有滴油。','油压报警、压力波动或润滑异响；需排除油量、滤网及泵本体问题。',['F-PARKER-STATIC']),
    'm-filter':entry('机油滤清器座静密封','滤芯与滤座之间失去密封，承压机油从接口向外泄漏。','持续漏油降低机油量，严重泄漏时可能影响供油压力和润滑。','滤座周围湿油、运转时漏油或机油液位下降。',['F-PARKER-STATIC']),
    'm-output':entry('摩托车输出轴唇形油封','输出轴穿壳处密封唇损伤，机油沿轴或隔套外圆向链轮一侧外漏。','持续失油影响发动机/变速器润滑；油封损伤本身不直接意味着齿轮失去传动。','前链轮附近油迹、甩油、机油液位下降；需与链条润滑剂区分。',['F-FST-SHAFT']),
    'm-spacer':entry('输出轴与隔套之间静密封O形圈','隔套内O形圈破损，机油可沿轴与隔套之间的间隙外漏，即使外圆油封仍完好。','持续失油可能导致润滑不足；只更换外侧唇形油封未必能消除此漏点。','前链轮及隔套内侧油迹、持续渗油。',['F-PARKER-STATIC']),
    'm-shift':entry('换挡轴摆动密封','密封唇损伤，机油沿穿出箱体的换挡轴外漏。','持续失油会影响润滑；密封破损本身不等于换挡鼓或拨叉无法动作。','换挡轴根部湿油、踏杆附近积油或滴油。',['F-FST-SHAFT']),
    'm-clutch-cover':entry('离合器罩盖平面静密封','罩盖垫片破损，湿式离合器油腔中的机油沿盖口接缝外漏。','持续失油影响润滑和散热；不能将盖垫外漏直接解释为离合器液压施压不足。','离合器盖周缘湿油、机油液位下降或滴油。',['F-PARKER-STATIC']),
    'm-release':entry('离合器分离轴摆动密封','穿壳分离轴处的密封唇失效，机油沿轴外漏。','持续失油可能降低油量；本图机械拉索结构不因此产生液压分泵压力损失。','分离轴根部及摇臂附近湿油、油泥。',['F-FST-SHAFT']),
    'm-generator-cover':entry('发电机盖静密封垫','湿式发电机罩盖结合面失去密封，机油沿接缝外漏。','持续失油影响润滑；盖垫破损本身不意味着发电机立即停止发电。','发电机盖周缘湿油、停车滴油。',['F-PARKER-STATIC']),
    'm-stator-wire':entry('发电机线束过线密封胶塞','胶塞与壳体或线束包胶界面失去密封，机油沿过线口或导线界面渗出。','机油损失及连接区域污染；电气异常需进一步确认线束和接插件状态。','出线口湿油、线束附近油迹，漏点可能沿导线迁移。',['F-PARKER-STATIC']),
    'm-starter-wire':entry('起动电机护线胶套（密封角色待确认）','胶套损伤可能失去护线、防尘或防水作用；是否承担气液密封需图纸确认。','若导致磨线或水尘进入，可能影响绝缘与电气连接；不能由胶套破损直接认定漏机油或起动失效。','胶套裂口、线皮磨损、水尘痕迹；电气故障需检测后确认。',['F-PARKER-STATIC']),
    'm-starter-mount':entry('起动电机安装口静密封O形圈','安装O形圈损坏，若该口连通机油腔，机油可沿电机安装口外漏。','持续失油影响油量；该圈破损本身不证明起动电机内部进油或电机已失效。','电机与箱体安装根部湿油、积油。',['F-PARKER-STATIC']),
    'm-inspection':entry('正时观察孔盖静密封','观察盖密封破损，使油腔中的飞溅机油或油雾沿盖口外泄。','持续漏油损失机油并污染机体；不直接改变正时传动关系。','观察盖周围湿油、油雾残留或滴油。',['F-PARKER-STATIC']),
    'm-thermostat':entry('节温器成型静密封圈','密封损坏可能使冷却液沿壳口外漏；若该圈同时分隔内部回路，也可能发生非预期旁通，取决于结构。','外漏导致冷却液不足；内部旁通可能影响升温及温度保持，不能直接判定蜡包或阀芯卡死。','接口湿痕、液位下降；温度建立缓慢或波动需结合实际流道诊断。',['F-HELLA-AIR']),
    'm-coolant-sleeve':entry('冷却插管成型密封胶套','胶套撕裂或失去压缩，使冷却液从管与座孔的配合间隙外漏。','失液及可能进气会削弱循环与换热能力。','插管根部湿痕、冷却液残留、液位下降。',['F-HELLA-AIR']),
    'm-coolant-hose':entry('冷却液橡胶管','胶管裂口、破损或端口配合失效，冷却液从管壁或接头泄漏。','液量下降和回路进气可能导致冷却不足；大漏时循环能力下降更快。','胶管湿润、鼓包裂纹、接头滴液、液位或温度异常。',['F-HELLA-AIR']),
    'm-intake':entry('进气歧管橡胶接头','接头裂纹或界面失去气密，使非计划空气进入进气系统。','可能导致混合气偏稀、怠速控制和燃烧稳定性下降；具体影响取决于计量方式及ECU补偿范围。','怠速不稳、启动困难、进气漏气声或燃油修正异常。',['F-SUBARU-INTAKE']),
    'm-injector-upper':entry('喷油器燃油侧上密封圈','喷油器与燃油轨之间的O形圈损坏，承压燃油从上接口向外泄漏。','燃油密封功能丧失；严重泄漏可影响供油压力，逸出的燃油遇到点火源存在起火风险。','喷油器上端湿油、燃油气味或可见渗漏。',['F-NHTSA-FUEL']),
    'm-injector-lower':entry('喷油器下端进气密封座','本图进气道喷射结构的下端密封座损坏，可能从安装座处吸入非计划空气。','可能影响混合气和怠速稳定；该下座不能统一当作燃油轨承压O形圈。','进气漏气声、怠速不稳或燃油修正异常；是否同时漏燃油取决于实际喷射结构。',['F-SUBARU-INTAKE']),
    'm-tensioner':entry('正时张紧器安装口静密封O形圈','张紧器安装O形圈破损，使机油沿壳体安装界面向外渗漏。','持续失油影响油量；仅安装圈损伤不能直接推出张紧器失去张紧力或正时失步。','张紧器根部湿油或滴油；如有链条异响，应另查张紧器机构和供油。',['F-PARKER-STATIC']),
    'm-breather-cover':entry('油气分离器盖静密封垫','盖垫破损，油雾或飞溅机油沿分离腔盖接口外泄，并可能出现非计划进气。','油雾收集与通气路径可能受影响，机体污染；垫片破损不必然等于通气堵塞。','盖口油雾残留、湿油或机油味。',['F-PARKER-STATIC']),
    'm-breather-joint':entry('曲轴箱通气接头密封胶套','胶套破损使通气接头周围泄漏油雾，可能引入非计划空气或水尘。','通气及油雾收集路径可能偏离设计；是否影响混合气取决于与进气系统的连接方式，不必然堵塞通气。','接头油泥、松动、湿油或周围水尘痕迹。',['F-PARKER-STATIC']),
    'm-transfer':entry('跨腔输油接管端部静密封','端部O形圈损坏，使压力机油向相邻腔体内泄或沿管端外漏。','若处于承压供油回路，内泄可能削弱下游供油；外壳未必出现油迹。','油压偏低或润滑异响等可能表现，须结合油路压力与结构定位。',['F-PARKER-STATIC']),
    'm-sensor-oil':entry('机油压力传感器安装口静密封','本图传感器位于机油压力回路，安装垫密封失效可使机油从根部外漏。','持续漏油降低油量，严重泄漏可能影响压力；不能直接把密封损伤视作传感器电气故障。','传感器根部湿油、滴油；压力异常需结合机械压力实测。',['F-PARKER-STATIC']),
    'm-sensor-conditional':entry('传感器接口密封（按介质位置）','安装密封破损使其所在油腔或水腔介质从接口外漏；具体介质应按实际安装位置确定。','油侧持续失液影响润滑，水侧影响冷却；密封问题不直接证明信号失真。','传感器根部油迹或冷却液残留，结合流道及液体性质确认。',['F-PARKER-STATIC','F-HELLA-AIR']),
    'pipe-oil':entry('过油接管两端静密封O形圈','任一端部圈破损，都可能使承压机油沿管外径与座孔间隙泄向周边腔体。','在供油回路中可能造成下游供油或压力不足；内泄不一定在发动机外侧可见。','压力或润滑异常需结合油路检查；两个端圈的实际数量和位置以原厂图纸为准。',['F-PARKER-STATIC']),
    'pipe-coolant':entry('冷却水插管径向静密封O形圈','单道O形圈破损或失去径向压缩，冷却液沿金属管与座孔间隙外漏。','持续失液或回路进气会降低循环与换热能力。','插接座周围湿痕、结晶残留、冷却液液位下降。',['F-HELLA-AIR']),
    'pipe-grommet':entry('穿管阶梯多唇胶套（角色待验证）','外槽松脱或内唇损伤会降低夹持、护管及阻隔水尘的能力；气液密等级尚未核实。','若实物承担气液密封，可能出现对应介质泄漏；若仅护管，则主要风险是管件磨损或水尘侵入。','胶套裂口、松脱、管壁磨痕；是否有油、水或气泄漏需结合实际用途试验确认。',['F-PARKER-STATIC']),
    'pipe-pushrod':entry('OHV推杆护管上、下端静密封','上端O形圈或下端成型密封损坏，回油/机油飞溅区域中的机油沿护管端部外漏。','持续失油可能降低机油量并污染机体；密封本身破损不直接改变推杆行程或配气正时。','护管上端或下端湿油、滴油，需分别定位两端漏点。',['F-PARKER-STATIC'])
  };

  function match(d) {
    if (!d || d.status === 'structure') return null;
    if (d.failureKey && Object.prototype.hasOwnProperty.call(entries,d.failureKey)) return d.failureKey;
    const name = String(d.name || '');
    const assembly = String(d.assembly || '');
    if (['pipe-oil','pipe-coolant','pipe-grommet','pipe-pushrod'].includes(assembly)) return assembly;
    if (/火花塞井.*密封/.test(name)) return 'm-plugwell';
    if (/缸盖罩.*(垫片|密封垫)/.test(name)) return 'm-cover';
    if (/气门杆油封/.test(name)) return 'm-valvestem';
    if (/放油螺塞.*密封/.test(name)) return 'm-drain';
    if (/机油加注.*(形圈|密封)/.test(name)) return 'm-filler';
    if (/水泵轴油封/.test(name)) return 'm-water-oil';
    if (/水泵机械密封|机械密封辅助/.test(name)) return 'm-water-mechanical';
    if (/水泵盖.*形圈/.test(name)) return 'm-water-cover';
    if (/水泵壳体.*形圈/.test(name)) return 'm-water-housing';
    if (/吸油管.*密封/.test(name)) return 'm-pickup';
    if (/机油滤清器座.*密封/.test(name)) return 'm-filter';
    if (/输出轴隔套.*形圈/.test(name)) return 'm-spacer';
    if (/变速器输出轴油封/.test(name) && assembly === 'transmission') return 'm-output';
    if (/换挡轴油封/.test(name)) return 'm-shift';
    if (/离合器盖密封/.test(name)) return 'm-clutch-cover';
    if (/离合器分离轴油封/.test(name)) return 'm-release';
    if (/发电机盖密封/.test(name)) return 'm-generator-cover';
    if (/发电机线束过线胶塞/.test(name)) return 'm-stator-wire';
    if (/起动电机护线胶套/.test(name)) return 'm-starter-wire';
    if (/起动电机安装.*形圈/.test(name)) return 'm-starter-mount';
    if (/正时观察孔盖密封/.test(name)) return 'm-inspection';
    if (/节温器.*密封圈/.test(name)) return 'm-thermostat';
    if (/冷却液插管.*胶套/.test(name)) return 'm-coolant-sleeve';
    if (/冷却液.*胶管/.test(name)) return 'm-coolant-hose';
    if (/进气歧管橡胶接头/.test(name)) return 'm-intake';
    if (/喷油器上密封/.test(name)) return 'm-injector-upper';
    if (/喷油器下.*密封/.test(name)) return 'm-injector-lower';
    if (/张紧器安装.*形圈/.test(name)) return 'm-tensioner';
    if (/油气分离器盖.*垫片/.test(name)) return 'm-breather-cover';
    if (/曲轴箱通气接头胶套/.test(name)) return 'm-breather-joint';
    if (/输油接管端部密封/.test(name)) return 'm-transfer';
    if (/传感器密封垫/.test(name)) return assembly === 'breather' ? 'm-sensor-oil' : 'm-sensor-conditional';
    return null;
  }

  window.SEAL_FAILURES = {sources,entries,match};
}());
