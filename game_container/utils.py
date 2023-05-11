import random
import threading
import time
from Constants import *


class Timer():
    def __init__(self):
        self.done = threading.Event()

    def start(self, seconds):
        if (seconds < 0):
            raise ValueError("Input must be positive")

        self.done.clear()
        self.timer_thread = threading.Thread(
            target=self.sleep, args=(seconds,))
        
        self.timer_thread.start()

    def sleep(self, seconds):
        time.sleep(seconds)
        self.done.set()

    def reset(self):
        self.timer_thread.join()
        self.done.clear()

    def is_done(self):
        return self.done.is_set()


class WordSelector():
    def __init__(self) -> None:
        self.words = []
        self.current_word = None
        self.client_view = None
        self.number_of_revealed_letters = 0

        with open(GameConfig.words_file_dir, "r") as f:
            self.words = f.read().split("\n")

    def pick_new_word(self) -> str:
        """ Get a new word from the list of words. """

        self.number_of_revealed_letters = 0
        self.current_word = random.choice(self.words)
        
        print(f"[Word Selector] Picked new word: {self.current_word}")

        self.words.remove(self.current_word)

        self.client_view = len(self.current_word) * ["_"]
        amount_of_letters_to_reveal = len(self.current_word) * GameConfig.starting_percentage
        for i in range(int(amount_of_letters_to_reveal)):
            self.reveal_letter()

    def reveal_letter(self) -> str:
        """ Reveal another letter of the word. """

        # Check if reached the maximum reveal percentage.
        revealed_percentage = self.number_of_revealed_letters / len(self.current_word)  
        if (revealed_percentage >= GameConfig.max_reveal_percentage):
            return
        
        letter_index = random.randint(0, len(self.current_word) - 1)
        letter = self.current_word[letter_index]

        self.client_view[letter_index] = letter
        self.number_of_revealed_letters += 1

    def get_client_view(self) -> str:
        return " ".join(self.client_view)






