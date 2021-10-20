import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function App() {
  
  const baseUrl= process.env.REACT_APP_URL + "/api/auth/";
  const [data, setData]=useState([]);
  const [modalInsertar, setModalInsertar]= useState(false);
  const [modalEditar, setModalEditar]= useState(false);
  const [modalEliminar, setModalEliminar]= useState(false);
  const [taskSeleccionado, settaskSeleccionado]=useState({
    id: '',
    name: '',
    descripcion: '',
    desarrollador: ''
  });

  useEffect(()=>{
    if(!cookies.get('access_token')){
        window.location.href="./";
    }
    peticionGet();
  },[])

  const cerrarSesion=()=>{
    cookies.remove('access_token', {path: "/"});
    window.location.href='./';
}

  const handleChange=e=>{
    const {name, value}=e.target;
    settaskSeleccionado((prevState)=>({
      ...prevState,
      [name]: value
    }))
    console.log(taskSeleccionado);
  }

  const abrirCerrarModalInsertar=()=>{
    setModalInsertar(!modalInsertar);
  }

  const abrirCerrarModalEditar=()=>{
    setModalEditar(!modalEditar);
  }

  const abrirCerrarModalEliminar=()=>{
    setModalEliminar(!modalEliminar);
  }

  const config_header = {
    headers: { Authorization: `Bearer ${ cookies.get('access_token')}` }
};

  const peticionGet=async()=>{
   
    await axios.get(baseUrl+'tasks', config_header)
    .then(response=>{
    console.log(response.data);
      setData(response.data.tasks);
    }).catch(error=>{
      console.log(error);
    })
  }

  const peticionPost=async()=>{
    var f = new FormData();
    f.append("name", taskSeleccionado.name);
    f.append("description", taskSeleccionado.description);
    f.append("completed", 0);
   
    await axios.post(baseUrl+'save-task', f, config_header)
    .then(response=>{
      console.log('response', response);
      setData(data.concat(response.data.task));
      abrirCerrarModalInsertar();
      alert('Tarea creada correctamente')
    }).catch(error=>{
      console.log(error);
    })
  }

  const peticionPut=async()=>{
    var f = new FormData();
    f.append("id", taskSeleccionado.id);
    f.append("name", taskSeleccionado.name);
    f.append("description", taskSeleccionado.description);
    f.append("completed", taskSeleccionado.completed);

    await axios.post(baseUrl+'update-task', f, config_header)
    .then(response=>{
      let dataNueva= data;
      dataNueva.map(task=>{
        if(task.id === taskSeleccionado.id){
          task.name=taskSeleccionado.name;
          task.description=taskSeleccionado.description;
          task.completed=taskSeleccionado.completed;
        }
      });
      setData(dataNueva);
      abrirCerrarModalEditar();
      alert('Tarea actualizada correctamente');
    }).catch(error=>{
      console.log(error);
    })
  }

  const peticionDelete=async()=>{
    var f = new FormData();
    f.append("id", taskSeleccionado.id);
    await axios.post(baseUrl+'delete', f, config_header)
    .then(response=>{
      setData(data.filter(task =>task.id !== taskSeleccionado.id));
      abrirCerrarModalEliminar();
      alert('Tarea eliminada correctamente');
    }).catch(error=>{
      console.log(error);
    })
  }

  const seleccionarTask=(task, caso)=>{
    settaskSeleccionado(task);

    (caso==="Editar")?
    abrirCerrarModalEditar():
    abrirCerrarModalEliminar()
  }

  if(cookies.get('access_token')){

    return (
      <div style={{textAlign: 'center'}}>
  <br />
        <button className="btn btn-success" onClick={()=>abrirCerrarModalInsertar()}>Insertar</button>
        <button className="btn btn-light" onClick={()=>cerrarSesion()}>Cerrar Sesión</button>
        <br /><br />
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Completada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map(task=>(
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.name}</td>
              <td>{task.description}</td>
              <td>{task.completed == 0 ? 'NO' : 'SI'}</td>
            <td>
            <button className="btn btn-primary" onClick={()=>seleccionarTask(task, "Editar")}>Editar</button> {"  "}
            <button className="btn btn-danger" onClick={()=>seleccionarTask(task, "Eliminar")}>Eliminar</button>
            </td>
            </tr>
          ))}


        </tbody> 

      </table>
      <Modal isOpen={modalInsertar}>
        <ModalHeader>Crear Tarea</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label>Nombre: </label>
            <br />
            <input type="text" className="form-control" name="name" onChange={handleChange}/>
            <br />
            <label>Description: </label>
            <br />
            <input type="text" className="form-control" name="description" onChange={handleChange}/>
            <br />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-primary" onClick={()=>peticionPost()}>Guardar</button>{"   "}
          <button className="btn btn-danger" onClick={()=>abrirCerrarModalInsertar()}>Cancelar</button>
        </ModalFooter>
      </Modal>


      
      <Modal isOpen={modalEditar}>
        <ModalHeader>Editar Framework</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label>Nombre: </label>
            <br />
            <input type="text" className="form-control" name="name" onChange={handleChange} value={taskSeleccionado && taskSeleccionado.name}/>
            <br />
            <label>Descripción: </label>
            <br />
            <input type="text" className="form-control" name="description" onChange={handleChange} value={taskSeleccionado && taskSeleccionado.description}/>
            <br />
            <label>Completada: </label>
            <br />
            <select className="form-control" name="completed" onChange={handleChange}>
              <option value="1" selected={taskSeleccionado.completed == 1}>SI</option>
              <option value="0" selected={taskSeleccionado.completed == 0}>NO</option>
            </select>
            {/* <input type="text" className="form-control" name="completed" /> */}
            <br />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-primary" onClick={()=>peticionPut()}>Editar</button>{"   "}
          <button className="btn btn-danger" onClick={()=>abrirCerrarModalEditar()}>Cancelar</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalEliminar}>
          <ModalBody>
          ¿Estás seguro que deseas eliminar la tarea {taskSeleccionado && taskSeleccionado.name}?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={()=>peticionDelete()}>
              Sí
            </button>
            <button
              className="btn btn-secondary"
              onClick={()=>abrirCerrarModalEliminar()}
            >
              No
            </button>
          </ModalFooter>
        </Modal>

      </div>
    );
  } else {
    return (
      <div></div>
    )
  }
}

export default App;