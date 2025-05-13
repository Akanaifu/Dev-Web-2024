import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
// ...existing imports...

@NgModule({
  declarations: [
    // ...existing declarations...
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule, // Ensure this is imported
    // ...existing imports...
  ],
  providers: [],
  bootstrap: [
    /* ... */
  ],
})
export class AppModule {}
