import React, {Component} from 'react';
import '../css/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Cookies from 'universal-cookie';

const baseUrl= process.env.REACT_APP_URL + "/api/auth/login";
const cookies = new Cookies();

class Login extends Component {
    state={
        form:{
            username: '',
            password: ''
        }
    }

    handleChange=async e=>{
        await this.setState({
            form:{
                ...this.state.form,
                [e.target.name]: e.target.value
            }
        });
        console.log(this.state.form)
    }

    iniciarSesion = async()=>{
        let json = {
            "email":  this.state.form.username,
            "password":  this.state.form.password
          }

        await axios.post(baseUrl, json)
        .then(response=>{
            return response.data;
        })
        .then(response=>{
            console.log('response', response);
            if(response != ""){

                cookies.set('access_token', response.access_token, {path: "/"});
                
                const config = {
                    headers: { Authorization: `Bearer ${response.access_token}` }
                };

                let url_users =  process.env.REACT_APP_URL + '/api/auth/user';

                axios.get(url_users, config).then(data => {
                    var data_user = data.data;

                    cookies.set('nombre', data_user.name, {path: "/"});

                    alert(`Bienvenido ${data_user.name}`);
                    window.location.href="./menu";
                })

               
            }else{
                alert('El usuario o la contraseña no son correctos');
            }
        })
        .catch(error=>{
            alert('El usuario o la contraseña no son correctos');
            console.log(error);
        })

    }

    
    componentDidMount() {
        if(cookies.get('access_token')){
            window.location.href="./menu";
        }
    }

    render() {
        return (
            <div className="containerPrincipal">
                <div className="containerSecundario">
                <div className="form-group">
                    <label>Usuario: </label>
                    <br />
                    <input
                    type="text"
                    className="form-control"
                    name="username"
                    onChange={this.handleChange}
                    />
                    <br />
                    <label>Contraseña: </label>
                    <br />
                    <input
                    type="password"
                    className="form-control"
                    name="password"
                    onChange={this.handleChange}
                    />
                    <br />
                    <button className="btn btn-primary" onClick={()=> this.iniciarSesion()}>Iniciar Sesión</button>
                </div>
                </div>
            </div>
        );
    }
}

export default Login;