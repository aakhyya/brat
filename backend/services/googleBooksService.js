const axios=require("axios");

class GoogleBooksService{
    constructor(){
        this.apiKey=process.env.GOOGLE_BOOKS_API_KEY;
        this.baseURL = process.env.GOOGLE_BOOKS_BASE_URL;

        this.client=axios.create({
            baseURL:this.baseURL,
            timeout:5000
        });
    }

    async searchBooks(query){ //search books by title/author
        try{
            if(!query || query.trim().length < 2){
                throw new Error('Query too short');
            }

            const res=await this.client.get("/volumes",{
                params:{
                    q:query.trim(),
                    key:this.apiKey,
                    maxResults:20,
                }
            });
            
            const items=res.data.items || [];
            return items.map(volume=>{
                const info=volume.volumeInfo || {};

                return{
                    googleBooksId: volume.id,
                    title: info.title || 'Untitled',
                    authors: info.authors || [],
                    publishedDate: info.publishedDate || null,
                    description: info.description || '',
                    thumbnail: info.imageLinks?.thumbnail
                        ? info.imageLinks.thumbnail.replace('http:', 'https:')
                        : null
                };
            });
        }
        catch(err){
            console.error('GoogleBooks searchBooks error:', err.message);
            return [];
        }
    }

    async getBookDetails(volumeId){ //get book details by ID
        try{
            if(!volumeId){
                throw new Error('Volume ID is required');
            }

            const res=await this.client.get(`/volumes/${volumeId}`,{
                params:{
                    key:this.apiKey
                }
            });

            return this.normalizeBookData(res.data);
        }
        catch(err){
            console.error('GoogleBooks getBookDetails error:', err.message);
            throw err;
        }
    }

    normalizeBookData(volume){
        const info=volume.volumeInfo ||{};

        return{
            type: 'book',
            title: info.title || 'Untitled',
            description: info.description || '',
            releaseDate: this.parsePublishedDate(info.publishedDate),

            creators: (info.authors || []).map(author => ({
                name: author,
                role: 'author'
            })),

            metadata: {
                pageCount: info.pageCount || null,
                publisher: info.publisher || null,
                isbn: info.industryIdentifiers
                ?.find(id => id.type === 'ISBN_13') //unique id: International Standard Book Number
                ?.identifier || null, //ISBN-13 better, popular, modern
                categories: info.categories || []
            },

            externalIds: {
                googleBooks: volume.id,
                isbn: info.industryIdentifiers
                ?.find(id => id.type === 'ISBN_13')
                ?.identifier || null
            },

            images: {
                cover: info.imageLinks?.thumbnail
                ? info.imageLinks.thumbnail.replace('http:', 'https:')
                : null
            }
        };
    }

    parsePublishedDate(dateString){ //helper: Handle partial dates like "1999" or "1999-07"
        if(!dateString) return null;
        
        if(/^\d{4}$/.test(dateString)){ // if year only
            return new Date(`${dateString}-01-01`);
        }

        if(/^\d{4}-\d{2}$/.test(dateString)){ //if year and month
            return new Date(`${dateString}-01`);
        }

        return new Date(dateString);
    }
}

module.exports=new GoogleBooksService();