import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento local
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // La ruta asume que el comando se ejecuta desde el directorio 'backend'
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        // Renombrar el archivo para evitar conflictos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'));
    }
};

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Máximo 5MB
    }
});
