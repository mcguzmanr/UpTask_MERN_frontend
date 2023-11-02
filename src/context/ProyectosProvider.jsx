
import { useState, useEffect, createContext } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useNavigate } from 'react-router-dom'
import checkLocalStorage from '../repository/checkLocalStorage';
import useAuth from '../hooks/useAuth'
import io from 'socket.io-client'

// eslint-disable-next-line no-unused-vars
let socket;

const ProyectosContext = createContext();

// eslint-disable-next-line react/prop-types
const ProyectosProvider = ({children}) => {

    const [proyectos, setProyectos] = useState([]);
    const [alerta, setAlerta] = useState({});
    const [proyecto, setProyecto] = useState({});
    const [cargando, setCargando] = useState(false);
    const [modalFormularioTarea, setModalFormularioTarea] = useState(false)
    const [tarea, setTarea] = useState({})
    const [ modalElimarTarea, setModalEliminarTarea ] = useState(false)
    const [colaborador, setColaborador] = useState({})
    const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false)
    const [buscador, setBuscador] = useState(false)


    const navigate = useNavigate();
    const {auth} = useAuth()

    useEffect(() => {
        const obtenerProyectos = async () => {
            try {
                checkLocalStorage() 
                const { data } = await clienteAxios('/proyectos', checkLocalStorage()) 
                setProyectos(data)      
            } catch (error) {
                console.log(error)
            }
        }
        obtenerProyectos()
    }, [auth])

    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL)
    }, [])

    const mostrarAlerta = alerta => {
        setAlerta(alerta)

        setTimeout(() => {
            setAlerta({})
        }, 5000);
    }

    const submitProyecto = async proyecto => {

        if(proyecto.id) {
            await editarProyecto(proyecto)
        } else {
            await nuevoProyecto(proyecto)
        }

        return

    }

    const editarProyecto = async proyecto => {
        try {
            checkLocalStorage()
            
            const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, checkLocalStorage())

            // Sincronizar el state
            const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState)
            setProyectos(proyectosActualizados)

            // Mostrar la alerta y redirección
            setAlerta({
                msg: 'El proyecto ha sido actualizado correctamente',
                error: false
            })

            setTimeout(() => {
                setAlerta({}),
                navigate('/proyectos')
            }, 4000);

        } catch (error) {
           console.log(error) 
        }
    }

    const nuevoProyecto = async proyecto => {
        try {
            checkLocalStorage()

            const { data } = await clienteAxios.post('/proyectos', proyecto, checkLocalStorage())
            
            setProyectos([...proyectos, data])

            setAlerta({
                msg: 'Proyecto creado correctamente',
                error: false
            })

            setTimeout(() => {
                setAlerta({}),
                navigate('/proyectos')
            }, 4000);
        } catch (error) {
           console.log(error) 
        }
    }

    const obtenerProyecto = async id => { 
        setCargando(true)
        try {
            checkLocalStorage()

            const { data } = await clienteAxios(`/proyectos/${id}`, checkLocalStorage())
            setProyecto(data)
            setAlerta({})
        } catch (error) {
            navigate('/proyectos')
            setAlerta({
                msg: error.response.data.msg,
                error: true
            }, 3000)
            setTimeout(() => {
                setAlerta({})
            })
        } finally {
            setCargando(false)
        }
    }

    const eliminarProyecto = async id =>  {
        try {
            checkLocalStorage()

            const { data } = await clienteAxios.delete(`/proyectos/${id}`, checkLocalStorage())

            // Sincronizar el state
            const proyectosActualizados = proyectos.filter(proyectoState => proyectoState._id !== id)
            setProyectos(proyectosActualizados)

            setAlerta({
                msg: data.msg,
                error: false
            })

            setTimeout(() => {
                setAlerta({}),
                navigate('/proyectos')
            }, 3000);

        } catch (error) {
            console.log(error)
        }
    }

    const handleModalTarea = () => {
        setModalFormularioTarea(!modalFormularioTarea)
        setTarea({})
    }

    const submitTarea = async tarea => {
        if(tarea?.id) {
            await editarTarea(tarea)
        } else {
            await crearTarea(tarea)
        }
    }

    const crearTarea = async tarea => {
        try {
            checkLocalStorage() 
            const { data } = await clienteAxios.post('/tareas', tarea, checkLocalStorage())

            setAlerta({})
            setModalFormularioTarea(false)


            //  Socket IO
            socket.emit('nueva tarea', data)

        } catch (error) {
           console.log(error) 
        }
    }

    const editarTarea = async tarea => {
        try {
            checkLocalStorage() 
            const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, checkLocalStorage())

            setAlerta({})
            setModalFormularioTarea(false)

            // Socket
            socket.emit('actualizar tarea', data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleModalEditarTarea = tarea => {
        setTarea(tarea)
        setModalFormularioTarea(true)
    }

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea)
        setModalEliminarTarea(!modalElimarTarea)
    }

    const eliminarTarea = async () => {
        try {
            checkLocalStorage() 
            const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, checkLocalStorage())
            setAlerta({
                msg: data.msg,
                error: false
            })

            setModalEliminarTarea(false)

            // Socket
            socket.emit('eliminar tarea', tarea)


            setTarea({})
            setTimeout(() => {
                setAlerta({})
            }, 3000)
            
        } catch (error) {
            console.log(error)
        }
    }

    const submitColaborador = async email => {

        setCargando(true)
        try {
            checkLocalStorage()
            const { data } = await clienteAxios.post('/proyectos/colaboradores', {email}, checkLocalStorage())
            
            setColaborador(data)
            setAlerta({})
        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        } finally {
            setCargando(false)
        }
    }

    const agregarColaborador = async email => {
        try {
            checkLocalStorage() 
            // eslint-disable-next-line no-unused-vars
            const { data } = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`, email, checkLocalStorage()) 

            setAlerta({
                msg: data.msg,
                error: false
            })
            setColaborador({})
            
            setTimeout(() => {
                setAlerta({})
            }, 3000)

        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        }
    }

    const handleModalEliminarColaborador = (colaborador) => {
        setModalEliminarColaborador(!modalEliminarColaborador)
        setColaborador(colaborador)
    }

    const eliminarColaborador = async () => {
        try {
            checkLocalStorage() 
            const { data } = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, {id: colaborador._id }, checkLocalStorage())

            const proyectoActualizado = {...proyecto}

            proyectoActualizado.colaboradores =  proyectoActualizado.colaboradores.filter(colaboradorState => colaboradorState._id !== colaborador._id)

            setProyecto(proyectoActualizado)
            setAlerta({
                msg: data.msg,
                error: false
            })
            setColaborador({})
            setModalEliminarColaborador(false)

            setTimeout(() => {
                setAlerta({})
            }, 3000)

        } catch (error) {
            console.log(error.response)
        }
    }

    const completarTarea = async id => {
        try {
            checkLocalStorage() 
            const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, checkLocalStorage())
            setTarea({})
            setAlerta({})

            // Socket
            socket.emit('cambiar estado', data)

        } catch (error) {
            console.log(error.response)
        }
    }

    const handleBuscador = () => {
        setBuscador(!buscador)
    }

    // Socket io
    const submitTareasProyecto = (tarea) => {
        // Agrega la tarea al state
        const proyectoActualizado = { ...proyecto }
        proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea]
        setProyecto(proyectoActualizado)
    }

    const eliminarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto} 
        proyectoActualizado.tareas = proyectoActualizado.tareas.filter(tareaState => 
        tareaState._id !== tarea._id )
        setProyecto(proyectoActualizado)
    }

    const actualizarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto} 
        proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState =>
        tareaState._id === tarea._id ? tarea : tareaState )
        setProyecto(proyectoActualizado)
    }

    const cambiarEstadoTarea = tarea => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas =  proyectoActualizado.tareas.map(tareaState => 
        tareaState._id === tarea._id ? tarea : tareaState)
        setProyecto(proyectoActualizado)
    }

    const cerrarSesionProyectos = () => {
        setProyectos([])
        setProyecto({})
        setAlerta({})
    }

    return (
        <ProyectosContext.Provider
            value={{
                proyectos,
                mostrarAlerta,
                alerta,
                submitProyecto,
                obtenerProyecto,
                proyecto,
                cargando,
                eliminarProyecto,
                modalFormularioTarea,
                handleModalTarea,
                submitTarea,
                handleModalEditarTarea,
                tarea,
                modalElimarTarea,
                handleModalEliminarTarea,
                eliminarTarea,
                submitColaborador,
                colaborador,
                agregarColaborador,
                handleModalEliminarColaborador, 
                modalEliminarColaborador,
                eliminarColaborador,
                completarTarea,
                buscador,
                handleBuscador,
                submitTareasProyecto,
                eliminarTareaProyecto,
                actualizarTareaProyecto,
                cambiarEstadoTarea,
                cerrarSesionProyectos
            }}
        >
            {children}
        </ProyectosContext.Provider>
    )
}

export {
    ProyectosProvider
}

export default ProyectosContext