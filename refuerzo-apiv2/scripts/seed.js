/**
 * Crea roles y usuarios de prueba con contraseña conocida.
 * Idempotente: lo que ya existe no se toca.
 *
 * Documentación: ../../docs/probar-el-flujo.md
 */
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const T = { view: true, edit: true };
const V = { view: true, edit: false };

const ROLES = {
  admin: {
    alumnos: T, asistencias: T, document: T, email: T, grado: T, image: T,
    postulantes: T, profesores: T, profile: T, programa: T, recomendadores: T,
    roles: T, secciones: T, tutores: T, usuarios: T,
  },
  recomendador: {
    asistencias: T, grado: V, image: T, postulantes: T, profile: T, programa: V,
  },
  alumno: {
    image: T, profile: T, secciones: T,
  },
  tutor: {
    document: T, image: T, profile: T, secciones: T,
  },
  profesor: {
    alumnos: T, document: T, grado: V, image: T, profile: T, secciones: T,
    tutores: T,
  },
};

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB || 'RefuerzoEscolar';
const ROLE = process.env.SEED_ROLE || 'admin';
const EMAIL = process.env.SEED_EMAIL || 'admin@local.test';
const PASSWORD = process.env.SEED_PASSWORD || 'admin123';
const NOMBRE = process.env.SEED_NOMBRE || 'Admin Local';

async function main() {
  if (!MONGO_URI) {
    console.error('Falta MONGO_URI');
    process.exit(1);
  }
  if (!ROLES[ROLE]) {
    console.error(`SEED_ROLE="${ROLE}" no existe. Opciones: ${Object.keys(ROLES).join(', ')}`);
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  const ahora = new Date();

  for (const [name, pages] of Object.entries(ROLES)) {
    const existe = await db.collection('Roles').findOne({ name });
    if (existe) {
      console.log(`· rol ${name}: ya existía`);
    } else {
      await db.collection('Roles').insertOne({ name, pages, createdAt: ahora, updatedAt: ahora });
      console.log(`✓ rol ${name}: creado`);
    }
  }

  const yaExiste = await db.collection('Users').findOne({ email: EMAIL });
  if (yaExiste) {
    console.log(`· usuario ${EMAIL}: ya existía, no lo toco`);
  } else {
    await db.collection('Users').insertOne({
      nombre: NOMBRE,
      email: EMAIL,
      telefono: '00000000',
      password: await bcrypt.hash(PASSWORD, 10),
      image: '/default-avatar.png',
      role: ROLE,
      isActive: true,
      idDependingRole: null,
      createdAt: ahora,
      updatedAt: ahora,
    });
    console.log(`✓ usuario ${EMAIL}: creado (rol ${ROLE}, activo)`);
  }

  console.log(`\n  http://localhost:3000  →  ${EMAIL} / ${PASSWORD}\n`);
  await client.close();
}

main().catch((err) => {
  console.error('El seed falló:', err.message);
  process.exit(1);
});
