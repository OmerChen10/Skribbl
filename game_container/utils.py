import random
import threading
import time
from Constants import *


class Timer():
    def __init__(self):
        self.done = threading.Event()
        self.abort = threading.Event()

    def start(self, duration):
        """ Starts the timer for the given amount of seconds. """

        self.duration = duration

        if (duration < 0):
            raise ValueError("Input must be positive")

        self.done.clear()
        self.timer_thread = threading.Timer(duration, self.done.set)
        self.start_time = time.time()
        self.timer_thread.start()

    def reset(self):
        """ Resets the timer. """

        self.timer_thread.cancel()
        self.done.clear()

    def is_done(self):
        """ Returns whether the timer is done. """

        return self.done.is_set()
    
    def getTimeLeft(self):
        """ Returns the time left on the timer. """

        return self.duration - (time.time() - self.start_time)


class WordSelector():
    def __init__(self) -> None:
        self.words = []
        self.current_word = None
        self.client_view = None
        self.number_of_revealed_letters = 0

        with open(GameConfig.WORDS_FILE_DIR, "r") as f:
            self.words = f.read().split("\n")

    def pick_new_word(self) -> str:
        """ Get a new word from the list of words. """

        self.number_of_revealed_letters = 0
        self.current_word = random.choice(self.words)
        
        print(f"[Word Selector] Picked new word: {self.current_word}")

        self.words.remove(self.current_word)

        self.client_view = len(self.current_word) * ["_"]
        amount_of_letters_to_reveal = len(self.current_word) * GameConfig.STARTING_PERCENTAGE
        for i in range(int(amount_of_letters_to_reveal)):
            self.reveal_letter()

    def reveal_letter(self) -> str:
        """ Reveal another letter of the word. """

        # Check if reached the maximum reveal percentage.
        revealed_percentage = self.number_of_revealed_letters / len(self.current_word)  
        if (revealed_percentage >= GameConfig.MAX_REVEAL_PERCENTAGE):
            return
        
        letter_index = random.randint(0, len(self.current_word) - 1)
        letter = self.current_word[letter_index]

        self.client_view[letter_index] = letter
        self.number_of_revealed_letters += 1

    def get_client_view(self) -> str:
        """ Returns the client view of the word (With the hidden letters). """

        return " ".join(self.client_view)






