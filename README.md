# DB API POSTABLE

# 1. CLONAR EL REPOSITORIO
git clone git@github.com:codeableorg/postable-NNunezMedina.git

# 2. INSTALAR DEPENDENCIAS
npm install

# 3. CREAR BASES DE DATOS DE PRODUCCION Y PRUEBA
createdb db_postable
createdb postable-test

# 4. CORRER MIGRACIONES
npm run db:migrate up

# 5. REALIZAR PRUEBAS EN THUNDER CLIENT



