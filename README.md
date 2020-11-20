# My MLH Dashboard
I got tired of looking at all of [HackISU's](http://hackisu.com) registration info as JSON output so I organized the stuff I often used and MyMlhDash was born. This is painless way to have a look at your [MyMLH](https://my.mlh.io) results.

## Setup
Set the `APP_ID` and `SECRET` in index.html to your MyMLH client id and secret. You can find those by going to [the MyMLH application page](http://my.mlh.io/oauth/applications).

Open up index.html in your browser and have a look.
![Example Dash](/img/mymlhdash.png)

## Usage
The top bar shows the number of registrants (through MyMLH) and allows you to filter the results. 

**To filter results:**
 1. Select a column name
 2. Type in your search terms (it accepts regex, too).

#### Sorting
The table supports ordering by columns. Only in descending order though, it's not like have all day to build this. Just click on a table header and see the data ordered before your eyes.

#### Refreshing
In the bottom right corner, the refresh button will reload your registrants to save you the time of refreshing the whole entire page (it's a drag, I know).

#### Other Tables
Scrolling lower, there are a few other tables for fun.
 1. Majors - I like looking at the different majors that have applied to HackISU, this counts the different majors and lists the participants from each. It's not very smart though, but hey, it's something.
 ![Major Listing](/img/mymlhmajors.png)
 2. Schools - This shows the school people are from and could be a nice way of looking at the split between attendees from different schools.
 ![School Listing](/img/mymlhschools.png)
 3. Shirt Sizes - Finally, no more tallying up the numbers. This aggregates shirt sizes for you, like it should.
 ![Shirt Sizes](/img/mymlhshirts.png)
 4. Registrants over time - You can view the number of people who registered for your event over time.
 ![Registrants Over Time](/img/mymlhcharts.png)

## Updates
Feel free to use this however you'd like. It made my life a bit easier, and hopefully it can do the same for you.

Also, I ♥ people who make pull requests and open issues, so fire away!
