import { useEffect } from "react"
import FormularioColaborador from "../components/FormularioColaborador"
import useProyectos from "../hooks/useProyectos"
import { useParams } from "react-router-dom"
import Pulse from "../components/Pulse"
import Spinner from "../components/Spinner"
import Alerta from "../components/Alerta"

const NuevoColaborador = () => {

    const { obtenerProyecto, proyecto, cargando, colaborador, agregarColaborador, alerta } = useProyectos()
    const params = useParams()

    useEffect(() =>  {
        obtenerProyecto(params.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if(!proyecto._id) return <Alerta alerta={alerta} />
    return (
        <>
            {cargando ? <Pulse /> : (
                <>
                    <h1 className="text-4xl font-black">Añadir colaborador/(a) al Proyecto: {proyecto.nombre}</h1>

                    <div className="mt-10 flex justify-center">
                        <FormularioColaborador />
                    </div>

                    {cargando ? <Spinner /> : colaborador._id && (
                        <div className="flex justify-center mt-10">
                            <div className="bg-white py-10 px-5 md:w-1/2 rouded-lg shadow w-full">
                                <h2 className="text-center mb-10 text-2xl font-bold">
                                    Resultado: 
                                </h2>
                                <div className="flex justify-between item-center">
                                    <p>{colaborador.nombre}</p>

                                    <button
                                        type="button"
                                        className="bg-slate-500 px-5 py-2 rounded-lg uppercase text-white font-bold text-sm"
                                        onClick={() => agregarColaborador({
                                           email: colaborador.email 
                                        })}
                                    >
                                        Agragar al proyecto
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </>

            )}

        </>
    )
}

export default NuevoColaborador
