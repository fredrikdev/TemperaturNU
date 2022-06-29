/* 
TemperaturNU for Scriptable

Scriptable Widget for the (Swedish) website https:://temperatur.nu, using the provided API.

1) Create a new script in the iOS Scriptable app, add a name, color, glyph, and paste this script.
2) Visit https://temperatur.nu and find one or more places you like to show in the widget. Note their IDs from the page URL. For instance, the ID of the place Sthlm/Rosenlund at https://www.temperatur.nu/rosenlund2 is "rosenlund2".
3) On your home screen, add the new Scriptable Widget as a widget with the script. Set the parameter field to the IDs, separate multiple IDs with comma. For instance "rosenlund2,s-oestermalm,hammarby_sjostad,kungsholmen"

Provided for free, MIT, as-is, by fredrikdev 2022.
*/

// parameters
let params = args.widgetParameter || ""

let d = null, ex = null

if (false) {
  // test data
  params = "rosenlund2,s-oestermalm,hammarby_sjostad"
  d = JSON.parse(`{"full_exec_time":0.005547046661376953,"title":"Temperatur.nu API 1.17","client":"blocked","stations":[{"title":"Sthlm/Hammarby Sjöstad","id":"hammarby_sjostad","temp":"26.4","lat":"59.30308","lon":"18.10209","kommun":"Stockholms kommun","lastUpdate":"2022-06-28 19:38:48","lan":"Stockholms län","sourceInfo":"Temperaturdata från Per Härdig.","forutsattning":"","uptime":99,"felmeddelande":"Ok","start":"2013-05-03 18:24:03","moh":9,"url":"https://www.temperatur.nu/hammarby_sjostad.html"},{"title":"Sthlm/Rosenlund","id":"rosenlund2","temp":"25.8","lat":"59.308627","lon":"18.067382","kommun":"Stockholms kommun","lastUpdate":"2022-06-28 19:39:08","lan":"Stockholms län","sourceInfo":"Temperaturdata från Theo Tolv.","forutsattning":"Två termometrar som sitter på utsidan av en balkong ca 15 m över marken, en i riktning mot norr, och den andra mot söder. Termometrarna är inkapslade DS18B20 och styrs av en ESP32 som kommunicerar med AWS IoT. Den rapporterade temperaturen är den lägre av de två mätvärdena.","uptime":86,"felmeddelande":"Ok","start":"2021-01-29 14:54:00","moh":37,"url":"https://www.temperatur.nu/rosenlund2.html"},{"title":"Sthlm/Östermalm","id":"s-oestermalm","temp":"27.5","lat":"59.340203","lon":"18.067148","kommun":"Stockholms kommun","lastUpdate":"2022-06-28 19:37:24","lan":"Stockholms län","sourceInfo":"Temperaturdata från John Karlsson.","forutsattning":"Sensor (Aqara) på skuggbalkong på Birger Jarlsgatan","uptime":91,"felmeddelande":"Ok","start":"2020-07-07 10:59:35","moh":30,"url":"https://www.temperatur.nu/s-oestermalm.html"}]}`)
  d = d.stations
} else {  
  try {   
    // request the data
    let req = new Request(`http://api.temperatur.nu/tnu_1.17.php?cli=TemperaturNUScriptableWidget&verbose&p=${encodeURI(params)}`)
    let res = await req.loadJSON()
    if (!res.stations || res.stations.length == 0)
       throw new Error("No data received")
      
    // store data into d
    d = res.stations
  } catch (e) {
    ex = e.message
  }   
}

// layout data on widget

// setup
let padding = 6*Device.screenScale()
let paddingLine = 1*Device.screenScale()
let widgetFamily = config.widgetFamily || "medium";

let f = new DateFormatter()
f.useMediumDateStyle()
f.useShortTimeStyle()

let fm16 = Font.mediumSystemFont(14)
let fl16 = Font.lightSystemFont(14)
let fm40 = Font.lightRoundedSystemFont(38)
let fl40 = Font.lightSystemFont(38)

// helper
function row(p) {
  let r = p.addStack()
  let vertical = 0
  for (let x = 1; x < arguments.length; x++) {
    if (x == 1 && arguments[1][0].center) {
      r.addSpacer()
    }
    let i = arguments[x]
    let c = r.addStack()
    for (let y = 0; y < i.length; y++) {
      let s = i[y]
      if (s.vertical) {
        c.layoutVertically()
        c.centerAlignContent()
        vertical = s.vertical
      } else {
        c.centerAlignContent()
      }
      let tc = c.addStack(), t1 = null, t2 = null
      tc.setPadding(s.padt || 0, 0, s.padb || 0, 0)
    
      t1 = tc.addText(s.t1)
      t1.textColor = Color.white()
      t1.font = s.f1|| fl16
      t1.lineLimit = s.lineLimit || 1

      if (s.t2) {
        t2 = tc.addText(s.t2)
        t2.textColor = Color.white()
        t2.font = s.f2 || fl16
        t2.lineLimit = 1
      }
      
      if (vertical) {
        if (y == i.length - 1) {
        } else {
          c.addSpacer(vertical == 99 ? null : vertical)
        }
      } else {
        if (y == i.length - 1) {
          if (t1) t1.rightAlignText()
          if (t2) t2.rightAlignText()
        } else {
          c.addSpacer()
        }
      }
    }  
    if (x != arguments.length - 1) {
       r.addSpacer()
    }
    if (x == 1 && arguments[1][0].center) {
      r.addSpacer()
    }
  }
  return r
}

// build items to layout
let items = []
if (d) {
  ps = params.split(",")
  d = d.sort(function(a, b) { return ps.indexOf(a.id) - ps.indexOf(b.id) })
  for (let dd of d) {
    items.push([
    [ 
      { t1: `${dd.title}`, padt: 4, vertical: paddingLine, f1: fm16 },
      { t1: `${f.string(new Date(dd.lastUpdate.replace(" ", "T")))}`, padb: 4, f1: fl16 } 
    ],
    [
      { t1: `${dd.temp}`, f1: fm40, t2: `°`, f2: fl40, }
    ]
    ])
  }
}

// layout
let w = new ListWidget()
w.setPadding(0, 0, 0, 0)
w.minimumScaleFactor = 0.6

let c1 = new Color("3F93C9")
let c2 = new Color("2F83B9")
w.backgroundColor = c2

let s = w.addStack()
s.layoutVertically()

if (ex) {
  // data error
  let r1 = s.addStack()
  let t = r1.addText(`Error loading data. Please check that you've setup the parameters correctly: ${ex}`)
  t.textColor = Color.white()
  t.font = fm16
  r1.setPadding(padding, padding, padding, padding)
  r1.backgroundColor = new Color("FF666B")
} else if (widgetFamily == "small") {
  // small
  
  // row 1
  let r1 = row(s, [ { t1: `Temperatur.nu`, f1: fm16 } ])
  r1.setPadding(padding, padding, 0, padding)
  s.addSpacer()
   
  // row 2 
  let r2 = row(s, (items[0][1]))
  r2.setPadding(0, padding, 0, padding)
  s.addSpacer()
  
  // row 3
  items[0][0][0].lineLimit = 2
  let r3 = row(s, (items[0][0]))
  r3.setPadding(0, padding, padding, padding)
} else {
  // medium & large
  
  // row 1
  let r1 = row(s, [ { t1: `Temperatur.nu`, f1: fm16 } ])
  let cnt = Math.min(2, items.length)
  if (widgetFamily == "medium") {
    r1.setPadding(padding, padding, padding, padding)
  } else {
    cnt = Math.min(6, items.length)
    r1.setPadding(padding, padding, padding, padding)
  }
  
  // row 2-N
  for (let x = 0; x < cnt; x++) {
    let r2 = row(s, ...items[x])
    r2.setPadding(0, padding, 0, padding)
    r2.backgroundColor = x % 2 == 0 ? c1 : c2
  }
  s.addSpacer()
}

// display
if (config.runsInApp) {
  w.presentMedium()
} else {  
  Script.setWidget(w)
}
Script.complete()
