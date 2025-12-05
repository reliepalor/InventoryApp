import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface VerseEntry {
  reference: string;
  text: string;
}

@Component({
  selector: 'app-login-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-placeholder.component.html',
  styleUrls: ['./login-placeholder.component.css']
})
export class LoginPlaceholderComponent implements OnInit {

  verses: VerseEntry[] = [
    {
      reference: "Proverbs 16:3",
      text: "Commit to the Lord whatever you do, and he will establish your plans."
    },
    {
      reference: "Colossians 3:23",
      text: "Whatever you do, work at it with all your heart, as working for the Lord."
    },
    {
      reference: "Psalm 37:5",
      text: "Commit your way to the Lord; trust in him and he will act."
    }
  ];

  currentReference = "";
  currentText = "";
  index = 0;
  isVisible = true;

  displayDuration = 6000;
  fadeOutDuration = 600;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startNewVerse();
  }

  private startNewVerse() {
    const verse = this.verses[this.index];
    
    // Set content immediately
    this.currentReference = verse.reference;
    this.currentText = verse.text;
    this.isVisible = false;
    this.cdr.detectChanges();

    // Fade in
    setTimeout(() => {
      this.isVisible = true;
      this.cdr.detectChanges();
      
      // Wait for display duration, then fade out
      setTimeout(() => {
        this.fadeOutAndNext();
      }, this.displayDuration);
    }, 50);
  }

  private fadeOutAndNext() {
    this.isVisible = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.index = (this.index + 1) % this.verses.length;
      this.startNewVerse();
    }, this.fadeOutDuration);
  }
}
