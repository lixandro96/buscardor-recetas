function iniciarAPP(){
  const selectCategoria = document.querySelector('#categorias');
  const resultado = document.querySelector('#resultado')
  const formulario = document.querySelector('.formulario');

  const favoritosDiv = document.querySelector('.favoritos');
  if(favoritosDiv){
    obtenerFavoritos()
  }

  cargarCategorias()

  async function  cargarCategorias(){
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
     const response = await fetch(url)
     const data =  await response.json()
  
  
     mostrarCategorias(data.categories)
  }
  
  function mostrarCategorias(categorias){
    categorias.forEach(categoria => {
      const {strCategory} = categoria
      const opcion = document.createElement('OPTION');
      opcion.classList.add('categoria')
      opcion.value = strCategory
      opcion.textContent = strCategory
      
      if(selectCategoria){

        selectCategoria.appendChild(opcion)
      }
  
  
    });
  }
  if(formulario){
    formulario.addEventListener('change',cargarRecetas)
  }
  
  
  async function cargarRecetas(e){
    e.preventDefault()
  
    const categoria = e.target.value
    
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
    const response = await fetch(url);
    const data = await response.json()
  
    mostrarRecetas(data.meals)
    
  }
  
  function mostrarRecetas(recetas = []){

      
      limpiarHTML(resultado)

      const mensajeResultado = document.createElement('h3');
      mensajeResultado.classList.add('text-center','text-black','my-5')
      mensajeResultado.textContent  = recetas.length ? `Resultados`: 'No hay resultados'

      resultado.appendChild(mensajeResultado)

      recetas.forEach(receta => {
        const {strMeal,strMealThumb,idMeal} = receta;
        
        const contenedorCard = document.createElement('DIV');
        contenedorCard.classList.add('col-6','col-md-4','col-sm-6')

        const cardDiv = document.createElement('DIV');
        cardDiv.classList.add('card','mb-4');
        
        const imagen = document.createElement('IMG');
        imagen.alt = `Receta de ${strMeal ?? receta.titulo}`;
        imagen.src = strMealThumb ?? receta.imagen;
        imagen.classList.add('card-img-top','w-100');
      
        
        const cardBody = document.createElement('DIV')
        cardBody.classList.add('card-body');
  
        const title = document.createElement('H4');
        title.classList.add('card-title','text-center','mb-3');
        title.textContent = strMeal ?? receta.titulo       
        
        const btn = document.createElement('BUTTON');
        btn.classList.add('btn','btn-danger','w-100');
        btn.textContent = 'Ver Receta';
        btn.dataset.bsTarget = "#modal"
        btn.dataset.bsToggle = "modal"
        btn.onclick = () => seleccionarReceta(idMeal ?? receta.id)
        
        cardDiv.appendChild(imagen)
        cardDiv.appendChild(cardBody)
        cardBody.appendChild(title)
        cardBody.appendChild(btn)
        
        contenedorCard.appendChild(cardDiv)
        resultado.appendChild(contenedorCard)
        
      })
  }

  function limpiarHTML(selector){
    while(selector.firstChild){
      selector.removeChild(selector.firstChild)
    }
  }

  async function seleccionarReceta(id){
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    const response =  await fetch(url);
    const data = await response.json()

    mostrarRecetaModal(data.meals[0])
     
  }

  function mostrarRecetaModal(receta){

    const {idMeal,strMeal,strMealThumb,strInstructions,strYoutube} = receta
    const modalTitle = document.querySelector('.modal-title')
    modalTitle.textContent = strMeal;

    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}">
      
      <h4 class="my-3">Instrucciones</h4>
      <p>${strInstructions}</p>
      
      <h4>Ingredientes y cantidades</h4>
      
    `
      
      const listGroup = document.createElement('UL');
      listGroup.classList.add('list-group');
      
      for (let i = 1; i < 20; i++) {
        
        if(receta[`strIngredient${i}`]){
          
          const ingrediente = receta[`strIngredient${i}`]
          const cantidad = receta[`strMeasure${i}`]
          
          const ingredienteLi  = document.createElement('LI');
          ingredienteLi.classList.add('list-group-item');
          ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
          
          listGroup.appendChild(ingredienteLi)
        }
      }
      
      modalBody.appendChild(listGroup)
      
      if(strYoutube){
        const btnYoutube = document.createElement('A');
        btnYoutube.textContent = 'Ver tutorial en YouTube';
        btnYoutube.href = strYoutube;
        btnYoutube.target = '_blank'
        btnYoutube.classList.add('btn','btn-danger','my-4')
        
        modalBody.appendChild(btnYoutube)
        
      }
      
      // mostrar boton de cerrar y favoritos
      const footerModeal = document.querySelector('.modal-footer')
      
    limpiarHTML(footerModeal)
    const favoritoBtn = document.createElement('BUTTON');
    favoritoBtn.classList.add('btn','btn-danger','mx-2','col');
    favoritoBtn.textContent = existeStorage(idMeal) ? 'Eliminar favorito' : 'Agregar a favoritos';

    //localStorage
    favoritoBtn.onclick = () => {

      if(existeStorage(idMeal)){
          eliminarFavorito(idMeal)
          favoritoBtn.textContent = 'Agregar a favoritos';
          mostrarToast('Eliminado correctamente')
        return
      }

      guardarFavorito({
        id:idMeal,
        titulo:strMeal,
        imagen:strMealThumb
      })
      favoritoBtn.textContent = 'Eliminar favorito';
      mostrarToast('Agregado correctamente')
    }

    const cerrarBtn = document.createElement('BUTTON');
    cerrarBtn.classList.add('btn','btn-secondary','mx-2','col');
    cerrarBtn.dataset.bsDismiss = 'modal'
    cerrarBtn.textContent ='Cerrar';

    footerModeal.appendChild(favoritoBtn)
    footerModeal.appendChild(cerrarBtn)


    
  }

  function guardarFavorito(receta){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []

    localStorage.setItem('favoritos',JSON.stringify([...favoritos, receta]))
  } 

  function eliminarFavorito(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

    const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos',JSON.stringify(nuevosFavoritos))

  }

  function existeStorage(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

    return favoritos.some(favorito => favorito.id === id)
  }

  function mostrarToast(mensaje){
    const toastDiv = document.querySelector('#toast');
    const tostBody = document.querySelector('.toast-body');

    tostBody.textContent = mensaje
    const toast = new bootstrap.Toast(toastDiv);
    toast.show()
  }

  function obtenerFavoritos(){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    if(favoritos.length){
      console.log(favoritos);
      mostrarRecetas(favoritos)
      return
    }

    const noFavoritos = document.createElement('P')
    noFavoritos.classList.add('font-bold','fs-4','text-center','mt-5');
    noFavoritos.textContent = 'No hay favoritos';

    favoritosDiv.appendChild(noFavoritos)
  }
}

document.addEventListener('DOMContentLoaded',iniciarAPP)