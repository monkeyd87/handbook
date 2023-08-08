import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button,Nav,Navbar,Form,Card,Container,Spinner,Offcanvas} from 'react-bootstrap'

import {useState,useEffect} from 'react'


function App() {
  const [answer,setAnswer] = useState('')
  const [value,setValue]=useState('')
  const [isLoading, setIsLoading]=useState(false)
  const [show, setShow] = useState(false)
  const [questions,setQuestions] = useState([])

  const addQuestion = ()=>{
    const questionEl = JSON.parse(localStorage.questions)
    questionEl.push({answer,value})
    localStorage.questions = JSON.stringify(questionEl)
    setQuestions(JSON.parse(localStorage.questions))
    setValue(()=>'')

  }

  const handleSubmit= async(event)=>{
    event.preventDefault()
    if(!isLoading){
      if(value){
        setIsLoading(true)
        const response = await fetch('/api/v1/handbook',{
          method:'POST',
          headers:{
            'content-type': 'application/json'
          },
          body: JSON.stringify({question:value})
        })
        const data = await response.json()
        setAnswer(()=>data.data)

        
        setIsLoading(false)
      
        
      }
      
    }else{
      alert('you have to wait')
    }

  }

  useEffect(()=>{
    if(localStorage.questions){
      setQuestions(JSON.parse(localStorage.questions))
    }else{
      localStorage.questions = '[]'
    }
  },[])

  useEffect(()=>{
    if(value){
      addQuestion()
    }
  },[answer])

  
  return (
    <>
   <h1 className="text-center text-light m-0" style={{backgroundColor:'darkblue'}}>Student-Parent Handbook</h1>
   <Navbar className='shadow' sticky='top'>
    <Navbar.Brand className='p-3' href='https://www.williamleecollegeprep.org/' >
      <img src={require('./asscets/images/header_logo-WILCP.png')} style={{height:'50px'}}/>
    </Navbar.Brand>
   </Navbar>
   <Container className='justify-content-center align-items-center  d-flex vh-100'>
    <Offcanvas show={show} onHide={()=>setShow(false)}>
      
     <Offcanvas.Header closeButton><Offcanvas.Title>previous questions</Offcanvas.Title></Offcanvas.Header>
     <div style={{overflow:'auto'}}>
        {questions.map((question,index)=>{
        
        return(
          <Card key={index}>
            <Card.Body>
              <Card.Title>{question.value}</Card.Title>
              <Card.Text style={{textOverflow:'ellipsi',textWrap:'none'}} >{question.answer}</Card.Text>
            </Card.Body>
          </Card>
        )
      })}
      
     </div>
    </Offcanvas>
      
      <Card className='col-lg-4 col-md-6 col-sm-12 shadow  '>
        <Card.Body className=' justify-content-center   d-flex gap-3 flex-column'>
          <div style={{position:'relative',height:'200px'}}>
            <div className='overflow-auto bg-light h-100 p-1' >
              <pre style={{textWrap:'wrap',fontFamily:"Helvetica Neue",fontSize:'18px'}}>{answer}</pre>
            </div>
            {isLoading&&<Spinner size='sm' style={{position:'absolute',bottom:'5px',right:'5px'}} variant='success'/>}
          </div>
          <Form className=' ' onSubmit={handleSubmit}>
            <Form.Control onChange={(event)=>setValue(()=>event.target.value)}value={value} placeholder='ask your question...'/>
          </Form>
        </Card.Body>
        <Button onClick={()=>setShow(!show)}>expand</Button>
      </Card>
   </Container>
    </>


  );
}

export default App;
