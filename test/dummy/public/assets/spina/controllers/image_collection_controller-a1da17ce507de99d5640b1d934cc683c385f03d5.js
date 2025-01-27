import { Controller } from "@hotwired/stimulus"
import Sortable from "../libraries/sortablejs@1.13.0"

export default class extends Controller {
  static get targets() {
    return [ "collection", "fields" ]
  }
  
  connect() {
    setTimeout(function() {
      this.sortable = Sortable.create(this.collectionTarget, {
        animation: 150
      })
    }.bind(this), 250)
  }
  
  removeImage(event) {
    let id = event.currentTarget.dataset.id
    let image = document.getElementById(id)
    image.parentElement.removeChild(image)
  }
  
  handleDone(event) {
    let html = this.element.dataset.fields
    
    let range = document.createRange()
    range.selectNodeContents(document.body)
    let fragment = range.createContextualFragment(html)
    
    fragment.querySelector(`[data-media-picker-target="signedBlobId"]`).value = event.detail.signedBlobId
    fragment.querySelector(`[data-media-picker-target="filename"]`).value = event.detail.filename
    fragment.querySelector(`[data-media-picker-target="imageId"]`).value = event.detail.imageId
    fragment.querySelector('img').src = event.detail.thumbnail

    // Insert fields
    this.collectionTarget.appendChild(fragment)
  }
  
}