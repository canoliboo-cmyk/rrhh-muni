import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { toast, ToastContainer } from "react-toastify";
import { usuarios } from "../db/usuarios";


export default function LoginView() {

    const initialValues = {
        user: '',
        password: ''
    }

    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues})

    const navigate = useNavigate()

    const users = usuarios
    const handleLogin = (formData) => {
        const { user, password } = formData

        const usuarioValido = users.find(
            u => u.username === user && u.password === password
        )

        if (!usuarioValido) {
            toast.error("Usuario o contraseña incorrectos")
            return
        }
        navigate('/inicio')
    }

    return (
        <>
        <div 
            className="flex flex-col justify-center items-center min-h-screen bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: "url('/muni-fondo.jpg')" }}
        >
            <div className="bg-white border border-gray-300 shadow rounded-lg  max-w-[90%] md:max-w-[448px] w-full p-6">
                <div className="text-center">
                    <div className="inline-block max-w-[280px] rounded-2xl">
                        <img src="/muni.png" alt="Logo municipalidad" />
                    </div>
                    <h2 className="text-2xl font-bold mt-6 text-[#011571]">Iniciar Sesión</h2>
                    <p className="text-[#011571] text-[14px] ">Sistema de Gestión de Recursos Humanos</p>
                </div>

                <form 
                    className="mt-6"
                    onSubmit={handleSubmit(handleLogin)}
                    noValidate
                >
                    <div>
                        <label 
                            htmlFor="user"
                            className="font-semibold block text-[#011571]"
                        >Usuario</label>
                        <input 
                            id="user" 
                            type="text" 
                            placeholder="Escribe tu usuario" 
                            className="px-2 py-1.5 border border-gray-300 rounded-lg w-full mt-1 shadow text-[#011571]"
                            {...register("user", {
                                required: "El usuario es obligatorio"
                            })}
                        />
                        {errors.user && (
                            <ErrorMessage>{errors.user.message}</ErrorMessage>
                        )}
                    </div>

                    <div className="mt-4">
                        <label 
                            htmlFor="password"
                            className="font-semibold block text-[#011571]"
                        >Contraseña</label>
                        <input 
                            id="password" type="password" placeholder="Escribe tu contraseña" 
                            className="px-2 py-1.5 border border-gray-300 rounded-lg w-full mt-1 shadow text-[#011571]"
                            {...register("password", {
                                required: "El password es obligatorio"
                            })}
                        />
                        {errors.password && (
                            <ErrorMessage>{errors.password.message}</ErrorMessage>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-[#011571]  text-white rounded-lg py-1.5 w-full mt-5 font-semibold cursor-pointer hover:bg-[#011571]/80 transition-colors duration-200"
                    >Iniciar Sesión</button>

                </form>
            </div>
        </div>

        
        <ToastContainer/>
        </>
    )
}
