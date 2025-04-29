A plugin to enhance the SiYuan flashcard experience

### Main Features

Left-click to generate card, right-click to open advanced options.

* One-click card making
* Clear current page flashcards
* Enhanced flashcard styles
* Enhanced cloze deletion
* RemNote-like interface
* Hierarchical flashcards
* Customized card pack creation
* Math block card creation
* Immersive card creation
* Incremental Reading

#### One-click Card Making

![Alt text](img/%E4%B8%80%E9%94%AE%E5%88%B6%E5%8D%A1.gif)

One-click card making type:

**Mark Block**

**List Block**

Simply add a marker at the end to create a card, supported markers include: ？, ?, 》》, >>, ||

**Super Block**

Vertical Super Block, Horizontal Super Block

### Right-Click Menu Content

#### Clear the current page flashcards

![Alt text](img/%E4%B8%80%E9%94%AE%E6%B8%85%E9%99%A4.gif)

#### Flashcard Style Enhancement

![Alt text](img/%E9%97%AA%E5%8D%A1%E6%A0%B7%E5%BC%8F%E5%A2%9E%E5%BC%BA.gif)

#### Hollowing Augmentation

![Alt text](img/%E6%8C%96%E7%A9%BA%E5%A2%9E%E5%BC%BA.gif)

#### Remnote Interface Category

![Alt text](img/%E7%B1%BBremnote%E7%95%8C%E9%9D%A2.gif)

#### Hierarchical Flashcards

![Alt text](img/%E5%B1%82%E7%BA%A7%E9%97%AA%E5%8D%A1.gif)

#### Custom Card Pack Creation

![Alt text](img/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8D%A1%E5%8C%85%E5%88%B6%E5%8D%A1.gif)

#### Math Block Card Making

![Alt text](img/%E6%95%B0%E5%AD%A6%E5%9D%97%E5%88%B6%E5%8D%A1.gif)

> Conditions for the math block card creation feature:  
> This feature only takes effect when the answer is hidden. Specifically, the card content must include at least one highlight, with the default shortcut "Alt+D". If there is only a standalone formula block without being highlighted, it will not generate a valid card.  
> In short, to ensure the math block card creation feature works properly, make sure your card content meets the following criteria:  
>* The math block card marking option must be enabled.  
>* At least one highlight marking must be included to hide the answer.  
>* A formula block alone cannot serve as the card content.  

#### Immersive Card Making (Unstable)

![Alt text](img/%E6%B2%89%E6%B5%B8%E5%BC%8F%E5%88%B6%E5%8D%A1.gif)

#### Incremental Reading

Once opened, you can use the shortcut key Alt + Q to create flashcards by extracting information, alt+W Generate a hollowed-out flash card

![Alt text](img/%E6%B8%90%E8%BF%9B%E5%BC%8F%E9%98%85%E8%AF%BB.gif)



### Defects

* [X] Configuration cannot be saved
* [X] Immersive card-making is not stable enough, removing cards may have a probability of not being able to remove the style (but the card has indeed been removed from the card package) (partly improved)
* [X] Unable to create marks for multiple card styles at once

### Acknowledgments List

The [community plugin system](https://github.com/zuoez02/siyuan-plugin-system) created by [zuoez02](https://github.com/zuoez02).

Reference to the [calendar plugin project](https://github.com/svchord/siyuan-arco-calendar) by the great [svchord](https://github.com/svchord).

Community member [BryceAndJuly](https://ld246.com/member/BryceAndJuly) implemented the prototype [【Share】Quickly create flashcards using the current document&apos;s second-level headings](https://ld246.com/article/1674135504898)

Community member [RenaEmiya - LinkDrop](https://ld246.com/member/RenaEmiya) generously provided [hiding the last block label during review](https://ld246.com/article/1680862515960/comment/1680866557430#comments).
