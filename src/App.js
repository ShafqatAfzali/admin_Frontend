import { useEffect, useState } from "react"

export default function App() {
  const [endring,setendring]=useState([])
  const [exist,setexist]=useState(false)
  const [søk_resultat,setsøk_resultat]=useState({})
  const [kunde_exist,setkunde_exist]=useState(false)
  const [visalt,setvisalt]=useState(true)
  const [søkverdi,setsøkverdi]=useState("")
  const [kunde,setkunde]=useState([])
  const [salg,setsalg]=useState([])
  const [vis_hva,setvis_hva]=useState({ikke_sendt:true,sendt:false,salg_inf:false})

  useEffect(()=>{
      async function kjør(){
          const resp = await fetch("/api/data_tilgang", {
              method: "GET",
              headers: {
                "Accept": "application/json"
              },
  
              credentials: "include",
          })
          const dataen= await resp.json()
          return dataen
      }
      kjør().then((data)=>{
          const kundene=data.kunde.reverse();
          const salgene=data.salg.reverse();
          setkunde(kundene)
          setsalg(salgene)
      })
  },[vis_hva])


  function finn(){
      setkunde_exist(false)
      setexist(false)
      const res_salg=salg.filter((sal)=>{
          let fant=false;
          setvisalt(false)
          if(sal.id===parseInt(søkverdi)){
              fant=true
          }
          return fant
      })
      const res_kunde=kunde.filter((kund)=>{
          let fant=false;
          if(kund.navn===søkverdi || kund.email===søkverdi || kund.id===parseInt(søkverdi) || kund.telefon===parseInt(søkverdi)){
              fant=true
          }
          return fant
      })
      if(res_kunde.length>0 || res_salg.length>0){
          if(res_kunde.length>0){
              //flere folk kan ha flere kjøp
              let all_salg_inf=[];
              res_kunde.forEach((kund)=>{
                  salg.forEach((sal) => {
                      if(sal.kunde_id===kund.id){
                          const data={kunde_id:kund.id,navn:kund.navn, telefon:kund.telefon, Adresse:kund.Adresse, status_:kund.status_, betalt:sal.betalt, valuta:sal.valuta, tid_kjøpt:sal.tid_kjøpt, tid_sendt:sal.tid_sendt,slag_id:sal.id, varer:sal.produkt_kjøpt};

                          all_salg_inf.push(data)
                      }
                  })
              })
              setsøk_resultat(all_salg_inf)
              setkunde_exist(true)

          } else{
              let kunde_som_kjøpte=kunde.filter(kund => kund.id===res_salg[0].kunde_id)
              kunde_som_kjøpte=kunde_som_kjøpte[0]

              const data={kunde_id:kunde_som_kjøpte.id,navn:kunde_som_kjøpte.navn, telefon:kunde_som_kjøpte.telefon, Adresse:kunde_som_kjøpte.Adresse, status_:kunde_som_kjøpte.status_, betalt:res_salg[0].betalt, valuta:res_salg[0].valuta, tid_kjøpt:res_salg[0].tid_kjøpt, tid_sendt:res_salg[0].tid_sendt,slag_id:res_salg[0].id}
              setsøk_resultat(data)
          }
          setexist(true)
          setvisalt(false)
      }

  }

  async function changestate(){
      await fetch("/api/change-state", {
          method: "POST",
          headers: {
              "Content-type":"application/json",
              "Accept": "application/json"
          },
          body:JSON.stringify(endring),
          credentials: "include",
      }).then((res)=>{window.location.reload();})
  }

  return (<div>
      <label style={{position:"relative", left:"35vw"}}>Søk med navn, telefon, email, kunde-id eller salg-id</label>
      <br/>
      <input placeholder="søk" name="søk" value={søkverdi} style={{height:"4vh",position:"relative", left:"35vw"}} onChange={(e)=>setsøkverdi(e.target.value)}/>
      <button onClick={finn} style={{height:"4vh", width:"8vw", left:"35vw", position:"relative"}}>Søk</button>
      <br/>
      
      {!visalt && (exist ? ( kunde_exist ? (<div>
          <div>
              {søk_resultat.map((ene, index)=>{
                  return <ul key={index}>
                      <li><h4>salg-id:{ene.slag_id}, kunde-id:{ene.kunde_id}, navn:{ene.navn}, telefon:{ene.telefon}, adresse:{ene.Adresse}, betalt:{ene.betalt}{ene.valuta}, status:{ene.status_}, tid-kjøpt:{ene.tid_kjøpt} tid-sendt:{ene.tid_sendt}, varer-kjøpt:{ene.varer}</h4></li>
                  </ul>
              })}
          </div>
          <button onClick={()=>setvisalt(!visalt)}>tilbake</button> 
          </div>) : (
              <div>
                <h4>salg-id:{søk_resultat.slag_id}, kunde-id:{søk_resultat.kunde_id}, navn:{søk_resultat.navn}, telefon:{søk_resultat.telefon}, adresse:{søk_resultat.Adresse}, betalt:{søk_resultat.betalt}{søk_resultat.valuta}, status:{søk_resultat.status_}, tid-kjøpt:{søk_resultat.tid_kjøpt} tid-sendt:{søk_resultat.tid_sendt}</h4>
                <button onClick={()=>setvisalt(!visalt)}>tilbake</button>  
              </div>
          )

      ) : (<div> <h4>finns ikke</h4>  <button onClick={()=>setvisalt(!visalt)}>tilbake</button> </div>))}
      
      
      {visalt &&
      <div>
          <button onClick={()=>{setvis_hva({ikke_sendt:true,sendt:false,salg_inf:false}); setvisalt(true)}}>Ikke Sendt</button>
          <button onClick={()=>{setvis_hva({ikke_sendt:false,sendt:true,salg_inf:false}); setvisalt(true)}}>Sendt</button>
          <button onClick={()=>{setvis_hva({ikke_sendt:false,sendt:false,salg_inf:true}); setvisalt(true)}}>Salg Info</button>
      </div>}


      {visalt && (vis_hva.ikke_sendt && <div> 
          <ul style={{margin:"10px", backgroundColor:"whitesmoke", borderStyle:"solid", borderRadius:"5px", borderColor:"lightgreen"}}>
          <button onClick={changestate}>bekreft endringer</button>
          {kunde.map((person,index)=>{
              const salget=salg.find(ene=>ene.betaling_id=person.betaling_id)
              if(person.status_ === "ikke sendt"){
                  return <li className="list_element" key={index} style={{ margin:"25px", backgroundColor:"slategray", borderStyle:"solid", borderRadius:"13px", borderColor:"lightgreen"}} >
                  <h2>varer-kjøpt:   {salget.produkt_kjøpt}</h2>
                  <h3 className="">navn:  {person.navn}</h3>
                  <h3>Adresse:   {person.Adresse}</h3>
                  <h3>postal code:   {person.zip_code}</h3>
                  <h3>city:   {person.city}</h3>
                  <h3>land:   {person.country}</h3>
                  <h3>bestilling-tid:   {person.tid_kjøpt}</h3>
                  <h4>status:   {person.status_}</h4>
                  <input className="bekk" type="radio" value={[person.id,person.betaling_id,person.email,person.navn, person.Adresse,person.zip_code, person.city, person.country]} onClick={(e)=>{setendring([...endring,[e.target.value]])}}/>send
              </li>}
          })}
      </ul></div>)}

      {visalt && (vis_hva.sendt && <ul style={{margin:"10px", backgroundColor:"whitesmoke", borderStyle:"solid", borderRadius:"5px", borderColor:"lightgreen"}}>
          {kunde.map((person,index)=>{
              if(person.status_ === "sendt"){
                  return <li key={index} style={{margin:"25px", backgroundColor:"slategray", borderStyle:"solid", borderRadius:"13px", borderColor:"lightgreen"}}>
                  <h4>kunde id: {person.id}, navn: {person.navn}, email:{person.email}, telefon: {person.telefon}</h4>
                  <h3>land:{person.country} zip code:{person.zip_code}, city:{person.city} adresse:{person.Adresse}</h3>
                  <h3>status:{person.status_}</h3>
              </li>
              }
          })}
          </ul>)}

      {visalt && (vis_hva.salg_inf && <ul style={{margin:"10px", backgroundColor:"whitesmoke", borderStyle:"solid", borderRadius:"5px", borderColor:"lightgreen"}}>{
          salg.map((sal,index)=>{
              return <li key={index} style={{margin:"25px", backgroundColor:"slategray", borderStyle:"solid", borderRadius:"13px", borderColor:"lightgreen"}}>
                  <h4>kunde id:{sal.kunde_id}  salg id:{sal.id}   betaling id:{sal.betaling_id}</h4>
                  <h4>{sal.betalt}{sal.valuta} betalt på {sal.tid_kjøpt}</h4>
                  <h4>varene ble {sal.status_}</h4>
              </li>
              })
              }
              </ul>)}

  </div> )
}

